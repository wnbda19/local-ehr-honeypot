import { HeartPulse, Stethoscope, Thermometer, UsersRound } from "lucide-react";
import { PatientTable } from "@/components/patient-table";
import type { Patient } from "@/lib/patients";

export function DashboardContent({ patients }: { patients: Patient[] }) {
  const stats = [
    { label: "Active patients", value: patients.length, icon: UsersRound },
    { label: "Appointments", value: 18, icon: Stethoscope },
    { label: "Vitals pending", value: 7, icon: HeartPulse },
    { label: "Lab reviews", value: 5, icon: Thermometer }
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <Icon className="text-clinical-700" size={20} />
              </div>
              <p className="mt-3 text-3xl font-semibold text-slate-950">{stat.value}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-950">Patient Registry</h2>
            <span className="text-sm text-slate-500">Live local Postgres data</span>
          </div>
          <PatientTable patients={patients} />
        </div>

        <div className="space-y-4">
          <div className="rounded border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-semibold text-slate-950">Appointments</h2>
            <div className="mt-4 space-y-3">
              {["09:00 Intake review", "11:30 Cardiology follow-up", "14:15 Pediatric asthma plan"].map((item) => (
                <div key={item} className="rounded border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-semibold text-slate-950">Vitals Queue</h2>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded bg-clinical-50 p-3">
                <p className="font-semibold text-clinical-900">124/78</p>
                <p className="text-xs text-slate-500">BP avg</p>
              </div>
              <div className="rounded bg-clinical-50 p-3">
                <p className="font-semibold text-clinical-900">98.4</p>
                <p className="text-xs text-slate-500">Temp</p>
              </div>
              <div className="rounded bg-clinical-50 p-3">
                <p className="font-semibold text-clinical-900">97%</p>
                <p className="text-xs text-slate-500">SpO2</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
