import type { Patient } from "@/lib/patients";

export function PatientTable({ patients }: { patients: Patient[] }) {
  return (
    <div className="overflow-hidden rounded border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Patient</th>
            <th className="px-4 py-3">Age</th>
            <th className="px-4 py-3">Diagnosis</th>
            <th className="px-4 py-3">Doctor</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {patients.map((patient) => (
            <tr key={patient.id} className="hover:bg-clinical-50/60">
              <td className="px-4 py-3 font-medium text-slate-950">{patient.name}</td>
              <td className="px-4 py-3 text-slate-600">{patient.age}</td>
              <td className="px-4 py-3 text-slate-600">{patient.diagnosis}</td>
              <td className="px-4 py-3 text-slate-600">{patient.doctor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
