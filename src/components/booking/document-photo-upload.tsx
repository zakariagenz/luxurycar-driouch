"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { compressImageToDataUrl } from "@/lib/image";
import { useLocale } from "@/components/i18n/locale-provider";
import { cn } from "@/lib/utils";

interface DocumentPhotoUploadProps {
  label: string;
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
}

export function DocumentPhotoUpload({
  label,
  value,
  onChange,
}: DocumentPhotoUploadProps) {
  const { t } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const dataUrl = await compressImageToDataUrl(file);
      onChange(dataUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />

      {value ? (
        <div className="relative overflow-hidden rounded-lg border border-navy-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt={label}
            className="h-36 w-full object-cover bg-navy-50"
          />
          <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-navy-950/70 p-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="flex-1 bg-white/95"
              onClick={() => inputRef.current?.click()}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                t("changePhoto")
              )}
            </Button>
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="h-9 w-9"
              onClick={() => onChange(undefined)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className={cn(
            "flex h-36 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-navy-300 bg-navy-50/50 text-navy-600 transition hover:border-gold-500 hover:bg-gold-50/40",
            loading && "opacity-70"
          )}
        >
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-gold-600" />
          ) : (
            <ImagePlus className="h-6 w-6 text-gold-600" />
          )}
          <span className="text-sm font-medium">{t("uploadPhoto")}</span>
          <span className="px-4 text-center text-[11px] text-navy-400">
            {t("photoHint")}
          </span>
        </button>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
