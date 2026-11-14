import { redirect } from "next/navigation";

/** L'ancien mandat est devenu le test : on y renvoie les anciens liens. */
export default function PageMandat() {
  redirect("/test");
}
