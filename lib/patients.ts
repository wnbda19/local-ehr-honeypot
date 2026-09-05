import { query } from "@/lib/db";

export type Patient = {
  id: string;
  name: string;
  age: number;
  diagnosis: string;
  doctor: string;
};

export async function getPatients() {
  const result = await query<Patient>(
    "SELECT id, name, age, diagnosis, doctor FROM patients ORDER BY name ASC"
  );
  return result.rows;
}

export const fakePatients: Patient[] = [
  {
    id: "fake-1",
    name: "Jordan Vale",
    age: 48,
    diagnosis: "Annual cardiac observation",
    doctor: "Dr. Morgan Wells"
  },
  {
    id: "fake-2",
    name: "Lena Park",
    age: 31,
    diagnosis: "Routine lab follow-up",
    doctor: "Dr. Avery Chen"
  },
  {
    id: "fake-3",
    name: "Samir Cole",
    age: 62,
    diagnosis: "Medication reconciliation",
    doctor: "Dr. Morgan Wells"
  },
  {
    id: "fake-4",
    name: "Grace Taylor",
    age: 27,
    diagnosis: "Physical therapy review",
    doctor: "Dr. Riley Shah"
  }
];
