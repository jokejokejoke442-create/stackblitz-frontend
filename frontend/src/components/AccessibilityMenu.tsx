'use client';

import React, { useState } from 'react';
import { Settings, Eye, Type, Zap, Volume2, Keyboard, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useAccessibility } from './AccessibilityProvider';

const AccessibilityMenu: React.FC = () => {
  const { settings, updateSetting, resetSettings } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);

  const accessibilityOptions = [
    {
      key: 'highContrast' as const,
      label: 'High Contrast',
      description: 'Increase color contrast for better visibility',
      icon: Eye,
    },
    {
      key: 'largeText' as const,
      label: 'Large Text',
      description: 'Increase text size throughout the application',
      icon: Type,
    },
    {
      key: 'reducedMotion' as const,
      label: 'Reduced Motion',
      description: 'Minimize animations and transitions',
      icon: Zap,
    },
    {
      key: 'screenReader' as const,
      label: 'Screen Reader Support',
      description: 'Enhanced support for screen readers',
      icon: Volume2,
    },
    {
      key: 'keyboardNavigation' as const,
      label: 'Keyboard Navigation',
      description: 'Enhanced keyboard navigation support',
      icon: Keyboard,
    },
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-4 right-4 z-50 shadow-lg"
          aria-label="Accessibility settings"
        >
          <Settings className="w-4 h-4" />
          <span className="sr-only">Open accessibility menu</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0" 
        align="end"
        side="top"
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Accessibility Settings
            </CardTitle>
            <CardDescription>
              Customize the interface to meet your accessibility needs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {accessibilityOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div key={option.key} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <Icon className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <Label 
                        htmlFor={option.key}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {option.label}
                      </Label>
                      <Switch
                        id={option.key}
                        checked={settings[option.key]}
                        onCheckedChange={(checked) => updateSetting(option.key, checked)}
                        aria-describedby={`${option.key}-description`}
                      />
                    </div>
                    <p 
                      id={`${option.key}-description`}
                      className="text-xs text-gray-500"
                    >
                      {option.description}
                    </p>
                  </div>
                </div>
              );
            })}
            
            <div className="pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={resetSettings}
                className="w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default AccessibilityMenu;