import { Plus, Settings, FileJson, Upload, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/lib/i18n/language-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ThemeSettings } from "./theme-settings"
import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"
import { SearchBar } from "./search-bar"
import { Bookmark, Group } from "@/app/page"

interface NavbarProps {
  showSearch?: boolean;
  onAddBookmark?: () => void;
  onAddGroup?: () => void;
  data?: {
    groups: Group[];
    standaloneBookmarks: Bookmark[];
  };
  onBookmarkClick?: (bookmark: Bookmark) => void;
}

export function Navbar({ 
  showSearch = false, 
  onAddBookmark, 
  onAddGroup, 
  data,
  onBookmarkClick 
}: NavbarProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isHomePage = pathname === "/";
  const isImportExportPage = pathname === "/import-export";

  const handleLogoClick = () => {
    router.push("/");
  };

  return (
    <header className="border-b bg-card/90 backdrop-blur-sm sticky top-0 z-30">
      <div className="container mx-auto px-4 py-3">
        {/* Top row with logo and actions */}
        <div className="flex items-center justify-between mb-3">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleLogoClick}
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">BM</span>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold whitespace-nowrap">{t('app.title')}</h1>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{t('app.subtitle')}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isHomePage && (
              <>
                <Button variant="outline" size="sm" onClick={onAddBookmark}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('buttons.addBookmark')}
                </Button>

                <Button variant="outline" size="sm" onClick={onAddGroup}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('buttons.addGroup')}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/import-export")}
                >
                  <FileJson className="w-4 h-4 mr-2" />
                  {t('common.importExport')}
                </Button>
              </>
            )}

            <LanguageSwitcher />

            <Button variant="ghost" size="sm" onClick={() => setIsSettingsOpen(true)}>
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Bottom row with search */}
        {showSearch && data && (
          <div className="flex justify-center">
            <SearchBar
              groups={data.groups}
              standaloneBookmarks={data.standaloneBookmarks}
              onBookmarkClick={(bookmark: Bookmark) => onBookmarkClick?.(bookmark)}
            />
          </div>
        )}
      </div>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('settings.title')}</DialogTitle>
          </DialogHeader>
          <ThemeSettings />
        </DialogContent>
      </Dialog>
    </header>
  )
} 