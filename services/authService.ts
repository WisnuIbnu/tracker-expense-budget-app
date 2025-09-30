import { auth } from "@/config/firebase";

export function getCurrentUser() {
  return auth.currentUser; 
}
