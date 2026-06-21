import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { FileText, Upload } from 'lucide-react'
import { cn, formatFileSize } from '@/lib/utils'

interface UploadZoneProps {
  file: File | null
  onFile: (file: File) => void
}

export function UploadZone({ file, onFile }: UploadZoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) onFile(accepted[0])
    },
    [onFile]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors',
        isDragActive
          ? 'border-indigo-400 bg-indigo-50'
          : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'
      )}
    >
      <input {...getInputProps()} />
      {file ? (
        <div className="flex flex-col items-center gap-3">
          <FileText size={40} className="text-indigo-500" />
          <div>
            <p className="font-medium text-gray-900">{file.name}</p>
            <p className="text-sm text-gray-400">{formatFileSize(file.size)}</p>
          </div>
          <p className="text-xs text-gray-400">Toca para cambiar el archivo</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <Upload size={40} className="text-gray-400" />
          <div>
            <p className="font-medium text-gray-700">
              {isDragActive ? 'Suelta el PDF aquí' : 'Arrastra un PDF o toca para seleccionar'}
            </p>
            <p className="text-sm text-gray-400 mt-1">Solo archivos PDF</p>
          </div>
        </div>
      )}
    </div>
  )
}
