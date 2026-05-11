import Papa, { type ParseResult } from "papaparse";
import { useEffect, useState } from "react";
import EarRitualApp from "./EarRitualApp";

const SHEET_CSV_URL = import.meta.env.VITE_SHEET_CSV_URL;

type SheetRow = string[];

export default function AppFetcher() {
  const [sheetData, setSheetData] = useState<SheetRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!SHEET_CSV_URL) {
      setError("Missing VITE_SHEET_CSV_URL. Ritual source is not configured.");
      setIsLoading(false);
      return;
    }

    Papa.parse(SHEET_CSV_URL, {
      download: true,
      header: false,
      skipEmptyLines: true,
      complete: (results: ParseResult<SheetRow>) => {
        setSheetData(results.data);
        setIsLoading(false);
      },
      error: (parseError: Error) => {
        console.error("Error fetching sheet:", parseError);
        setError("Failed to load ritual data. The void stares back.");
        setIsLoading(false);
      },
    });
  }, []);

  if (error) {
    return (
      <div className="h-screen w-full bg-[#050505] flex items-center justify-center text-red-500 font-black uppercase tracking-widest">
        {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-zinc-800 border-t-red-600 rounded-full animate-spin" />
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">
            Syncing to Source...
          </p>
        </div>
      </div>
    );
  }

  return <EarRitualApp data={sheetData} />;
}
