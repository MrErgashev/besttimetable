"use client";

import { useState, useCallback } from "react";
import { useTeacherStore } from "@/stores/useTeacherStore";
import { useGroupStore } from "@/stores/useGroupStore";
import { useSubjectStore } from "@/stores/useSubjectStore";
import { useRoomStore } from "@/stores/useRoomStore";
import { useSubjectLoadStore } from "@/stores/useSubjectLoadStore";
import { useTimetableStore } from "@/stores/useTimetableStore";
import { useHydration } from "@/hooks/useHydration";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { GlassModal } from "@/components/ui/GlassModal";
import { DEFAULT_CONSTRAINTS } from "@/lib/constants";
import { generateGreedyWithEntries } from "@/lib/generator/greedy";
import { backtrackRepair } from "@/lib/generator/backtrack";
import { detectConflicts } from "@/lib/generator/constraints";
import type {
  ConstraintSet,
  GenerationResult,
  GenerationStatus,
  ScheduleEntry,
  SubjectLoad,
} from "@/lib/types";

export default function GeneratePage() {
  const hydrated = useHydration();
  const { teachers } = useTeacherStore();
  const { groups } = useGroupStore();
  const { subjects } = useSubjectStore();
  const { rooms } = useRoomStore();
  const { loads, addLoad, removeLoad } = useSubjectLoadStore();
  const { entries: existingEntries, bulkLoad } = useTimetableStore();

  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [progress, setProgress] = useState({ placed: 0, total: 0 });
  const [phase, setPhase] = useState<string>("");
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [generatedEntries, setGeneratedEntries] = useState<ScheduleEntry[]>([]);
  const [constraints, setConstraints] = useState<ConstraintSet>(DEFAULT_CONSTRAINTS);

  // SubjectLoad form
  const [showLoadForm, setShowLoadForm] = useState(false);
  const [loadGroupId, setLoadGroupId] = useState("");
  const [loadSubjectId, setLoadSubjectId] = useState("");
  const [loadTeacherId, setLoadTeacherId] = useState("");
  const [loadWeeklyHours, setLoadWeeklyHours] = useState("3");
  const [loadRoomType, setLoadRoomType] = useState("oddiy");

  // Confirmation modal
  const [showConfirm, setShowConfirm] = useState(false);

  const handleAddLoad = useCallback(() => {
    if (!loadGroupId || !loadSubjectId || !loadTeacherId) return;
    addLoad({
      group_id: loadGroupId,
      subject_id: loadSubjectId,
      teacher_id: loadTeacherId,
      weekly_hours: parseFloat(loadWeeklyHours) || 3,
      room_type: loadRoomType as SubjectLoad["room_type"],
    });
    setLoadGroupId("");
    setLoadSubjectId("");
    setLoadTeacherId("");
    setLoadWeeklyHours("3");
    setLoadRoomType("oddiy");
    setShowLoadForm(false);
  }, [loadGroupId, loadSubjectId, loadTeacherId, loadWeeklyHours, loadRoomType, addLoad]);

  const handleGenerate = useCallback(() => {
    if (loads.length === 0) return;

    setStatus("running");
    setPhase("Greedy algoritm...");
    setProgress({ placed: 0, total: 0 });
    setResult(null);
    setGeneratedEntries([]);

    // setTimeout to let UI update before blocking
    const generationStartTime = Date.now();
    setTimeout(() => {
      try {
        // Qo'lda qo'yilgan darslarni saqlash
        const manualEntries = existingEntries.filter((e) => e.is_manual);

        // 1-bosqich: Greedy
        const greedyResult = generateGreedyWithEntries({
          loads,
          teachers,
          rooms,
          groups,
          constraints,
          existingEntries: manualEntries,
          onProgress: (placed, total) => {
            setProgress({ placed, total });
          },
        });

        setPhase("Greedy yakunlandi");

        // Agar hammasi joylashgan bo'lsa
        if (greedyResult.result.placed === greedyResult.result.total) {
          setResult(greedyResult.result);
          setGeneratedEntries(greedyResult.entries);
          setStatus("complete");
          return;
        }

        // 2-bosqich: Backtracking
        setPhase("Backtracking tuzatish...");

        // Joylashtirilmagan darslar uchun load'larni topish
        const unplacedLoads: SubjectLoad[] = [];
        for (const load of loads) {
          const lessonsNeeded = Math.ceil(load.weekly_hours / 1.5);
          const placedCount = greedyResult.entries.filter(
            (e) =>
              e.group_ids.includes(load.group_id) &&
              e.subject_id === load.subject_id &&
              e.teacher_id === load.teacher_id
          ).length;
          for (let i = placedCount; i < lessonsNeeded; i++) {
            unplacedLoads.push(load);
          }
        }

        const allEntries = [...manualEntries, ...greedyResult.entries];
        const { entries: repairedEntries, repairedCount } = backtrackRepair({
          unplacedLoads,
          currentEntries: allEntries,
          teachers,
          rooms,
          groups,
          constraints,
          maxAttempts: 200,
        });

        const finalNew = repairedEntries.slice(manualEntries.length);
        const totalPlaced = greedyResult.result.placed + repairedCount;
        const totalNeeded = greedyResult.result.total;
        const conflicts = detectConflicts(repairedEntries, teachers, rooms, groups);

        const finalResult: GenerationResult = {
          status: totalPlaced === totalNeeded ? "complete" : "partial",
          placed: totalPlaced,
          total: totalNeeded,
          conflicts,
          duration_ms: Date.now() - generationStartTime,
        };

        setResult(finalResult);
        setGeneratedEntries(finalNew);
        setStatus(finalResult.status);
        setPhase("Yakunlandi");
      } catch (err) {
        console.error("Generation error:", err);
        setStatus("failed");
        setPhase(
          err instanceof Error
            ? `Xatolik: ${err.message}`
            : "Xatolik yuz berdi"
        );
        setResult({
          status: "failed",
          placed: 0,
          total: progress.total || 0,
          conflicts: [],
          duration_ms: Date.now() - generationStartTime,
        });
      }
    }, 50);
  }, [loads, teachers, rooms, groups, constraints, existingEntries]);

  const handleApply = useCallback(() => {
    // Qo'lda qo'yilganlarni saqlash + yangi generatsiya natijasini qo'shish
    const manualEntries = existingEntries.filter((e) => e.is_manual);
    bulkLoad([...manualEntries, ...generatedEntries]);
    setShowConfirm(false);
    setStatus("idle");
    setResult(null);
  }, [existingEntries, generatedEntries, bulkLoad]);

  if (!hydrated) return <Spinner className="py-20" />;

  const isReady = teachers.length > 0 && groups.length > 0 && subjects.length > 0 && rooms.length > 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Avtomatik jadval tuzish</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Dars yuklamalarini kiriting va avtomatik jadval tuzilsin
          </p>
        </div>
      </div>

      {/* Ma'lumotlar holatini tekshirish */}
      {!isReady && (
        <GlassCard>
          <div className="text-center py-8">
            <p className="text-[var(--muted)] mb-2">
              Avval quyidagilarni qo&apos;shing:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {teachers.length === 0 && <Badge variant="warning">O&apos;qituvchilar</Badge>}
              {groups.length === 0 && <Badge variant="warning">Guruhlar</Badge>}
              {subjects.length === 0 && <Badge variant="warning">Fanlar</Badge>}
              {rooms.length === 0 && <Badge variant="warning">Xonalar</Badge>}
            </div>
          </div>
        </GlassCard>
      )}

      {isReady && (
        <>
          {/* Dars yuklamalari */}
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Dars yuklamalari
                <span className="text-sm font-normal text-[var(--muted)] ml-2">
                  ({loads.length} ta)
                </span>
              </h2>
              <Button size="sm" onClick={() => setShowLoadForm(true)}>
                + Qo&apos;shish
              </Button>
            </div>

            {loads.length === 0 ? (
              <p className="text-sm text-[var(--muted)] text-center py-6">
                Dars yuklamasi qo&apos;shilmagan. Har bir guruh uchun qaysi fan, qaysi
                o&apos;qituvchi, haftasiga necha soat ekanini belgilang.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left px-3 py-2 text-[var(--muted)]">Guruh</th>
                      <th className="text-left px-3 py-2 text-[var(--muted)]">Fan</th>
                      <th className="text-left px-3 py-2 text-[var(--muted)]">O&apos;qituvchi</th>
                      <th className="text-center px-3 py-2 text-[var(--muted)]">Soat/hafta</th>
                      <th className="text-center px-3 py-2 text-[var(--muted)]">Xona turi</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {loads.map((load) => {
                      const group = groups.find((g) => g.id === load.group_id);
                      const subject = subjects.find((s) => s.id === load.subject_id);
                      const teacher = teachers.find((t) => t.id === load.teacher_id);
                      return (
                        <tr key={load.id} className="border-b border-[var(--border)] last:border-0">
                          <td className="px-3 py-2">{group?.name || "?"}</td>
                          <td className="px-3 py-2">
                            <span
                              className="inline-block w-2 h-2 rounded-full mr-1.5"
                              style={{ backgroundColor: subject?.color }}
                            />
                            {subject?.short_name || "?"}
                          </td>
                          <td className="px-3 py-2">{teacher?.short_name || "?"}</td>
                          <td className="text-center px-3 py-2">{load.weekly_hours}</td>
                          <td className="text-center px-3 py-2">
                            <Badge variant="default">
                              {load.room_type === "oddiy" ? "Oddiy" :
                               load.room_type === "laboratoriya" ? "Lab" :
                               load.room_type === "kompyuter_xona" ? "Komp." : "Majlis"}
                            </Badge>
                          </td>
                          <td className="px-1">
                            <button
                              onClick={() => removeLoad(load.id)}
                              className="p-1 text-[var(--muted)] hover:text-[var(--color-danger)] transition-colors"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>

          {/* Cheklovlar */}
          <GlassCard>
            <h2 className="text-lg font-semibold mb-4">Cheklovlar</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={constraints.distribute_evenly}
                  onChange={(e) =>
                    setConstraints({ ...constraints, distribute_evenly: e.target.checked })
                  }
                  className="rounded"
                />
                Kunlar bo&apos;yicha teng taqsimlash
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={constraints.prefer_morning_for_first_year}
                  onChange={(e) =>
                    setConstraints({
                      ...constraints,
                      prefer_morning_for_first_year: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                1-kurs uchun ertalab afzal
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={constraints.avoid_last_slot}
                  onChange={(e) =>
                    setConstraints({ ...constraints, avoid_last_slot: e.target.checked })
                  }
                  className="rounded"
                />
                Oxirgi juftlikdan qochish
              </label>
              <div className="flex items-center gap-2 text-sm">
                <span>Maks. ketma-ket dars:</span>
                <select
                  value={constraints.max_consecutive_lessons}
                  onChange={(e) =>
                    setConstraints({
                      ...constraints,
                      max_consecutive_lessons: parseInt(e.target.value),
                    })
                  }
                  className="bg-[var(--surface-secondary)] rounded-[8px] px-2 py-1 text-sm border border-[var(--border)]"
                >
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>
            </div>
          </GlassCard>

          {/* Generatsiya tugmasi */}
          <div className="flex items-center gap-4">
            <Button
              onClick={handleGenerate}
              disabled={loads.length === 0 || status === "running"}
              size="lg"
            >
              {status === "running" ? (
                <span className="flex items-center gap-2">
                  <Spinner /> Tuzilmoqda...
                </span>
              ) : (
                "Jadval tuzish"
              )}
            </Button>
            {existingEntries.length > 0 && (
              <span className="text-sm text-[var(--muted)]">
                Mavjud: {existingEntries.length} ta dars
                (qo&apos;lda: {existingEntries.filter((e) => e.is_manual).length})
              </span>
            )}
          </div>

          {/* Progress */}
          {status === "running" && (
            <GlassCard>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--muted)]">{phase}</span>
                  <span className="font-mono">
                    {progress.placed}/{progress.total}
                  </span>
                </div>
                <div className="h-2 bg-[var(--surface)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-300"
                    style={{
                      width: `${progress.total ? (progress.placed / progress.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </GlassCard>
          )}

          {/* Natija */}
          {result && (
            <GlassCard>
              <h2 className="text-lg font-semibold mb-4">Natija</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--foreground)]">
                    {result.placed}
                  </div>
                  <div className="text-xs text-[var(--muted)]">Joylashtirildi</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--foreground)]">
                    {result.total}
                  </div>
                  <div className="text-xs text-[var(--muted)]">Jami darslar</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--foreground)]">
                    {result.conflicts.length}
                  </div>
                  <div className="text-xs text-[var(--muted)]">Konfliktlar</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--foreground)]">
                    {result.duration_ms < 1000
                      ? `${result.duration_ms}ms`
                      : `${(result.duration_ms / 1000).toFixed(1)}s`}
                  </div>
                  <div className="text-xs text-[var(--muted)]">Vaqt</div>
                </div>
              </div>

              {/* Status badge */}
              <div className="flex items-center gap-3 mb-4">
                <Badge
                  variant={
                    result.status === "complete"
                      ? "success"
                      : result.status === "partial"
                      ? "warning"
                      : "danger"
                  }
                >
                  {result.status === "complete"
                    ? "To'liq joylashtirildi"
                    : result.status === "partial"
                    ? `${result.total - result.placed} ta joylashtirilmadi`
                    : "Xatolik"}
                </Badge>
              </div>

              {/* Conflicts */}
              {result.conflicts.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-red-500 mb-2">
                    Konfliktlar:
                  </h3>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {result.conflicts.map((c, i) => (
                      <div key={i} className="text-xs text-red-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                        {c.description}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Apply button */}
              {generatedEntries.length > 0 && (
                <div className="flex gap-3">
                  <Button onClick={() => setShowConfirm(true)}>
                    Jadvalni qo&apos;llash
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setResult(null);
                      setGeneratedEntries([]);
                      setStatus("idle");
                    }}
                  >
                    Bekor qilish
                  </Button>
                </div>
              )}
            </GlassCard>
          )}
        </>
      )}

      {/* Add Load Modal */}
      <GlassModal
        open={showLoadForm}
        onClose={() => setShowLoadForm(false)}
        title="Dars yuklamasi qo'shish"
        size="sm"
      >
        <div className="space-y-4">
          <Select
            label="Guruh"
            value={loadGroupId}
            onChange={(e) => setLoadGroupId(e.target.value)}
            options={groups.map((g) => ({ value: g.id, label: g.name }))}
            placeholder="Guruh tanlang"
            required
          />
          <Select
            label="Fan"
            value={loadSubjectId}
            onChange={(e) => setLoadSubjectId(e.target.value)}
            options={subjects.map((s) => ({ value: s.id, label: s.name }))}
            placeholder="Fan tanlang"
            required
          />
          <Select
            label="O'qituvchi"
            value={loadTeacherId}
            onChange={(e) => setLoadTeacherId(e.target.value)}
            options={teachers.map((t) => ({
              value: t.id,
              label: t.short_name,
            }))}
            placeholder="O'qituvchi tanlang"
            required
          />
          <div>
            <label className="block text-sm font-medium mb-1">
              Haftalik soat
            </label>
            <input
              type="number"
              min="1.5"
              max="12"
              step="1.5"
              value={loadWeeklyHours}
              onChange={(e) => setLoadWeeklyHours(e.target.value)}
              className="w-full bg-[var(--surface-secondary)] rounded-[10px] px-3 py-2.5 text-sm border border-[var(--border)]"
            />
          </div>
          <Select
            label="Xona turi"
            value={loadRoomType}
            onChange={(e) => setLoadRoomType(e.target.value)}
            options={[
              { value: "oddiy", label: "Oddiy xona" },
              { value: "laboratoriya", label: "Laboratoriya" },
              { value: "kompyuter_xona", label: "Kompyuter xona" },
              { value: "majlis_xonasi", label: "Majlis xonasi" },
            ]}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowLoadForm(false)}>
              Bekor
            </Button>
            <Button onClick={handleAddLoad}>Qo&apos;shish</Button>
          </div>
        </div>
      </GlassModal>

      {/* Confirm Modal */}
      <GlassModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Jadvalni qo'llash"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--muted)]">
            {generatedEntries.length} ta yangi dars jadvalga qo&apos;shiladi.
            Avvalgi avtomatik darslar o&apos;chiriladi, qo&apos;lda qo&apos;yilganlar saqlanadi.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowConfirm(false)}>
              Bekor
            </Button>
            <Button onClick={handleApply}>Tasdiqlash</Button>
          </div>
        </div>
      </GlassModal>
    </div>
  );
}
