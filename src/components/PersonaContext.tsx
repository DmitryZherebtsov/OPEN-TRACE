"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { PersonaId } from "@/types/innovation";
import { getPersonaConfig, type PersonaConfig } from "@/lib/personas";

const STORAGE_KEY = "opentrace_persona_v1";
const VALID_PERSONAS: PersonaId[] = [
  "JST",
  "SZKOLY",
  "UCZELNIE",
  "INWESTORZY",
  "STARTUPY",
  "WYNALAZCY",
];

interface PersonaContextValue {
  personaId: PersonaId;
  persona: PersonaConfig;
  setPersonaId: (id: PersonaId) => void;
}

const PersonaContext = createContext<PersonaContextValue | null>(null);

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const [personaId, setPersonaIdState] = useState<PersonaId>("JST");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) as PersonaId | null;
      if (saved && VALID_PERSONAS.includes(saved)) {
        setPersonaIdState(saved);
      }
    } catch {
      // Brak dostępu do localStorage — pozostaje domyślny stan React
    }
  }, []);

  const setPersonaId = (id: PersonaId) => {
    setPersonaIdState(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // Ignoruj błędy prywatnego trybu przeglądarki
    }
  };

  return (
    <PersonaContext.Provider
      value={{
        personaId,
        persona: getPersonaConfig(personaId),
        setPersonaId,
      }}
    >
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona(): PersonaContextValue {
  const ctx = useContext(PersonaContext);
  if (!ctx) {
    throw new Error("usePersona musi być używane wewnątrz PersonaProvider");
  }
  return ctx;
}
