import { ProblemInput } from './ProblemInput';
import { ImageUploader } from './ImageUploader';
import { SampleIOFields } from './SampleIOFields';
import { ActionBar } from '../actions/ActionBar';
import { ErrorDisplay } from '../shared/ErrorDisplay';
import { useAppStore } from '../../store/appStore';

export function ProblemPane() {
  const { error, setError } = useAppStore();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-sm font-medium text-gray-900 dark:text-white">Problem Input</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <ErrorDisplay
            message={error}
            onDismiss={() => setError(null)}
          />
        )}

        <ProblemInput />
        <ImageUploader />
        <SampleIOFields />
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <ActionBar />
      </div>
    </div>
  );
}
