'use client';

import { useCallback, useEffect, useMemo } from 'react';
import type { ClipboardEvent, RefObject } from 'react';
import { FormControl, FormDescription, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GigPoster } from '@/app/_components/GigPoster';

interface PosterFieldProps {
  posterFile: File | null;
  onPosterFileChange: (file: File | null) => void;
  posterUrl: string;
  onPosterUrlChange: (url: string) => void;
  onClearPoster: () => void;
  posterFileInputRef: RefObject<HTMLInputElement | null>;
  existingPosterUrl?: string;
  variant?: 'create' | 'edit';
}

export default function PosterField(props: PosterFieldProps) {
  const {
    posterFile,
    onPosterFileChange,
    posterUrl,
    onPosterUrlChange,
    onClearPoster,
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

  const previewSrc = posterFile
    ? localPreviewUrl
    : posterUrl?.trim()
      ? posterUrl.trim()
      : isEdit
        ? existingPosterUrl
        : undefined;

  const hasPoster = !!posterFile || !!posterUrl?.trim();

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLDivElement | HTMLInputElement>) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            onPosterUrlChange('');
            onPosterFileChange(file);
            if (posterFileInputRef.current) {
              posterFileInputRef.current.value = '';
            }
            break;
          }
        }
      }
    },
    [onPosterFileChange, onPosterUrlChange, posterFileInputRef],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      onPosterFileChange(file);
      if (file) {
        onPosterUrlChange('');
      }
    },
    [onPosterFileChange, onPosterUrlChange],
  );

  const description = isEdit
    ? 'Upload a new image file, paste URL, or paste image from clipboard (optional).'
    : 'Upload an image file (max 10MB), paste URL, or paste image from clipboard.';

  return (
    <FormItem>
      <div className="text-sm font-medium leading-none">Poster:</div>

      <FormControl>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Input
              ref={posterFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            <Button type="button" variant="secondary" onClick={onClearPoster} disabled={!hasPoster}>
              Clear
            </Button>
          </div>
          <Input
            type="url"
            placeholder="Or paste poster URL or image (Ctrl+V)"
            value={posterUrl ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              onPosterUrlChange(v);
              if (v.trim()) {
                onPosterFileChange(null);
                if (posterFileInputRef.current) {
                  posterFileInputRef.current.value = '';
                }
              }
            }}
            onPaste={handlePaste}
          />
        </div>
      </FormControl>

      {previewSrc ? (
        <div className="mt-2">
          <GigPoster poster={previewSrc} title="Poster preview" />
        </div>
      ) : null}

      <FormDescription>
        {isEdit && existingPosterUrl ? (
          <>
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
            {description}
          </>
        ) : (
          description
        )}
      </FormDescription>
    </FormItem>
  );
}
