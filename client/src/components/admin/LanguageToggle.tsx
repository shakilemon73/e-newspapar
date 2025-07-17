import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Languages } from "lucide-react";

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
      className="h-10 w-10 p-0 hover:bg-accent/10"
      aria-label={t('language-toggle', 'Toggle language', 'ভাষা পরিবর্তন করুন')}
    >
      <Languages className="h-4 w-4" />
      <span className="sr-only">
        {t('current-language', `Current: ${language.toUpperCase()}`, `বর্তমান: ${language === 'en' ? 'ইংরেজি' : 'বাংলা'}`)}
      </span>
    </Button>
  );
}