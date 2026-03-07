import { Moon, Sun } from 'lucide-react';
import { useThemeCustomization } from '../contexts/ThemeCustomizationContext';
import { useTheme } from '../components/ui/ThemeProvider';

type PageHeaderProps = {
  readonly title: string;
  readonly description?: string;
};

function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-base-content">{title}</h1>
      {description && <p className="text-base-content/60 mt-1">{description}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const { customization, updateCustomization, resetCustomization } = useThemeCustomization();
  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <PageHeader title="Theme Settings" description="Customize your PhishGuard theme appearance" />

      <div className="w-full space-y-6">
        <div className="card bg-base-300/50 dark:bg-base-200/50 border border-base-300 max-w-lg">
          <div className="card-body">
            <h2 className="card-title text-lg text-base-content">Appearance</h2>
            <div className="flex items-center justify-between">
              <span className="text-base-content">Dark Mode</span>
              <button
                onClick={toggleTheme}
                className="btn btn-sm gap-2"
              >
                {theme === 'light' ? (
                  <>
                    <Moon className="h-4 w-4" />
                    <span>Enable</span>
                  </>
                ) : (
                  <>
                    <Sun className="h-4 w-4" />
                    <span>Disable</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="card bg-base-300/50 dark:bg-base-200/50 border border-base-300 max-w-lg">
          <div className="card-body">
            <h2 className="card-title text-lg text-base-content">Primary Color</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="hue" className="label text-sm font-medium text-base-content">
                  Hue: {customization.primaryHue}°
                </label>
                <input
                  id="hue"
                  type="range"
                  min="0"
                  max="360"
                  step="1"
                  value={customization.primaryHue}
                  onChange={(e) => updateCustomization({ primaryHue: Number(e.target.value) })}
                  className="range range-sm range-primary w-full"
                />
                <div className="flex justify-between text-xs text-base-content/50 px-1">
                  <span>Red</span>
                  <span>Yellow</span>
                  <span>Green</span>
                  <span>Cyan</span>
                  <span>Blue</span>
                  <span>Magenta</span>
                </div>
              </div>

              <div>
                <label htmlFor="saturation" className="label text-sm font-medium text-base-content">
                  Saturation: {customization.primarySaturation.toFixed(2)}
                </label>
                <input
                  id="saturation"
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.01"
                  value={customization.primarySaturation}
                  onChange={(e) =>
                    updateCustomization({ primarySaturation: Number(e.target.value) })
                  }
                  className="range range-sm range-primary w-full"
                />
              </div>

              <div>
                <label htmlFor="lightness" className="label text-sm font-medium text-base-content">
                  Lightness: {(customization.primaryLightness * 100).toFixed(0)}%
                </label>
                <input
                  id="lightness"
                  type="range"
                  min="0.4"
                  max="0.8"
                  step="0.01"
                  value={customization.primaryLightness}
                  onChange={(e) =>
                    updateCustomization({ primaryLightness: Number(e.target.value) })
                  }
                  className="range range-sm range-primary w-full"
                />
              </div>

              <div className="pt-2 p-3 bg-primary/20 rounded-lg border border-primary/30">
                <p className="text-sm text-base-content font-medium">Preview:</p>
                <div
                  className="mt-2 p-4 rounded text-white font-semibold text-center"
                  style={{
                    backgroundColor: `oklch(${customization.primaryLightness * 100}% ${customization.primarySaturation} ${customization.primaryHue})`,
                  }}
                >
                  Primary Color
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button onClick={resetCustomization} className="btn btn-outline btn-sm">
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}
