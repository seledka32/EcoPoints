'use client'

import { useTheme } from 'next-themes'
import { useLanguage } from '@/hooks/use-language'
import { languages, type Language } from '@/lib/languages'
import { Button } from '@/components/ui/button'
import { Moon, Sun, Globe } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeLanguageSwitcher() {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="flex items-center gap-2">
      {/* Theme Switcher */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className="text-muted-foreground hover:text-foreground"
        title={t('theme')}
      >
        {theme === 'dark' ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </Button>

      {/* Language Switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-2"
            title={t('language')}
          >
            <Globe className="h-4 w-4" />
            <span className="text-sm font-medium">{languages[language].flag}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {Object.entries(languages).map(([lang, { name, flag }]) => (
            <DropdownMenuItem
              key={lang}
              onClick={() => setLanguage(lang as Language)}
              className={language === lang ? 'bg-accent' : ''}
            >
              <span className="mr-2">{flag}</span>
              <span>{name}</span>
              {language === lang && <span className="ml-auto text-xs">✓</span>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
