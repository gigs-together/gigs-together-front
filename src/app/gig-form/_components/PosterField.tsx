'use client';

import { useEffect, useMemo } from 'react';
import type { RefObject } from 'react';
import { FormControl, FormDescription, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { GigPoster } from '@/app/_components/GigPoster';

type PosterMode = 'upload' | 'url';

interface PosterFieldProps {
  mode: PosterMode;
  onModeChange: (mode: PosterMode) => void;
  posterFile: File | null;
  onPosterFileChange: (file: File | null) => void;
  posterUrl: string;
  onPosterUrlChange: (url: string) => void;
  onClearPosterFile: () => void;
  posterFileInputRef: RefObject<HTMLInputElement | null>;
  existingPosterUrl?: string;
  variant?: 'create' | 'edit';
}

export default function PosterField(props: PosterFieldProps) {
  const {
    mode,
    onModeChange,
    posterFile,
    onPosterFileChange,
    posterUrl,
    onPosterUrlChange,
    onClearPosterFile,
    posterFileInputRef,
    existingPosterUrl,
    variant,
  } = props;

  const isEdit = variant === 'edit';

  const localPreviewUrl = useMemo(() => {
    if (!posterFile) return null;
    return URL.createObjectURL(posterFile);
  }, [posterFile]);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  const description = useMemo(() => {
    if (!isEdit) {
      return mode === 'upload' ? 'Upload an image file (max 10MB).' : 'Paste a direct image URL.';
    }
    return mode === 'upload'
      ? 'Upload a new image file to replace the poster (optional).'
      : 'Paste a new direct image URL to replace the poster (optional).';
  }, [isEdit, mode]);

  const previewSrc =
    mode === 'upload'
      ? localPreviewUrl
      : posterUrl?.trim()
        ? posterUrl.trim()
        : isEdit
          ? existingPosterUrl
          : undefined;

  return (
    <FormItem>
      <div className="space-y-2">
        <div className="text-sm font-medium leading-none">Poster:</div>
        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(v) => {
            const next = (v as PosterMode) || mode;
            onModeChange(next);
            if (next === 'upload') {
              onPosterUrlChange('');
            } else {
              onClearPosterFile();
            }
          }}
          className="justify-start"
        >
          <ToggleGroupItem type="button" value="upload" aria-label="Upload poster">
            Upload
          </ToggleGroupItem>
          <ToggleGroupItem type="button" value="url" aria-label="Use poster URL">
            URL
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <FormControl>
        {mode === 'upload' ? (
          <div className="flex items-center gap-2">
            <Input
              ref={posterFileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => onPosterFileChange(e.target.files?.[0] ?? null)}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={onClearPosterFile}
              disabled={!posterFile}
            >
              Clear
            </Button>
          </div>
        ) : (
          <Input
            type="url"
            placeholder={
              isEdit
                ? 'Paste new poster image URL (optional)'
                : 'e.g. https://example.com/poster.jpg'
            }
            value={posterUrl ?? ''}
            onChange={(e) => onPosterUrlChange(e.target.value)}
          />
        )}
      </FormControl>

      {previewSrc ? (
        <div className="mt-2">
          <GigPoster poster={previewSrc} title="Poster preview" />
        </div>
      ) : null}

      <FormDescription>
        {isEdit ? (
          <>
            {existingPosterUrl ? (
              <span>
                Current poster:{' '}
                <a
                  href={existingPosterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  open
                </a>
                .{' '}
              </span>
            ) : null}
            {description}
          </>
        ) : (
          description
        )}
      </FormDescription>
    </FormItem>
  );
}
