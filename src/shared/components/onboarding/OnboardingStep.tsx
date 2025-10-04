import { ReactNode } from "react";
import { Card, CardContent } from "@/src/shared/components/ui/card";

export interface OnboardingStepProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function OnboardingStep({
  children,
  title,
  description,
}: OnboardingStepProps) {
  return (
    <Card className='max-w-2xl mx-auto'>
      <CardContent className='p-6 sm:p-8'>
        {title && (
          <div className='mb-6'>
            <h2 className='text-xl sm:text-2xl text-foreground mb-2'>
              {title}
            </h2>
            {description && (
              <p className='text-muted-foreground'>{description}</p>
            )}
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
