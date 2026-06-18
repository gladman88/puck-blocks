import { useState } from 'react';
import type { CustomField } from '@puckeditor/core';

// Editor-only field. Uploads through the FMS proxy to the staff image-upload
// endpoint; relative path resolves same-origin in the FMS editor.
const UPLOAD_URL = '/api/v1/fms/site/upload-image/';

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=')[1]) : undefined;
}

/**
 * Image input with TWO options: upload a file (stored on our server) OR paste a
 * URL. Both set the same string value (the image URL the block renders).
 */
function ImageInput({
  value,
  onChange,
}: {
  value?: string;
  onChange: (value: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.append('file', file);
      const csrf = readCookie('csrftoken');
      const res = await fetch(UPLOAD_URL, {
        method: 'POST',
        body,
        credentials: 'include',
        headers: csrf ? { 'X-CSRFToken': csrf } : undefined,
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { url: string };
      onChange(data.url);
    } catch {
      setError('Не удалось загрузить файл');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sbf">
      {value ? (
        <div className="sbf__preview">
          <img src={value} alt="" />
          <button type="button" className="sbf__remove" onClick={() => onChange('')}>
            Убрать
          </button>
        </div>
      ) : null}

      <label className={`sbf__btn ${busy ? 'sbf__btn--busy' : ''}`}>
        {busy ? 'Загрузка…' : '⬆ Загрузить картинку'}
        <input
          type="file"
          accept="image/*"
          hidden
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
            e.target.value = '';
          }}
        />
      </label>

      <input
        type="text"
        className="sbf__url"
        placeholder="…или вставьте URL"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />

      {error ? <p className="sbf__error">{error}</p> : null}
    </div>
  );
}

/**
 * A Puck field for an image URL with upload-or-paste UX. Generic over the value
 * type so it fits both required (`string`) and optional (`string | undefined`)
 * props — TS infers the parameter from the field's contextual type.
 */
export function imageField<T extends string | undefined>(label: string): CustomField<T> {
  return {
    type: 'custom',
    label,
    render: ({ value, onChange }) => (
      <ImageInput value={value ?? ''} onChange={(next) => onChange(next as T)} />
    ),
  };
}
