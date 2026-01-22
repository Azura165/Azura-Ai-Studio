"use client";

import { TabsContainer } from "@/components/remove-bg-component/tabs-container";

export function EditorWrapper() {
  // Langsung render tanpa dynamic import di level ini
  // Supaya menu tab muncul instan
  return <TabsContainer />;
}
