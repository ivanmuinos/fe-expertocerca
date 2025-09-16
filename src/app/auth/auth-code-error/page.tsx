"use client"

import { Button } from "@/src/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/shared/components/ui/card"
import { AlertCircle } from "lucide-react"
import { useNavigate } from "@/src/shared/lib/navigation"

export default function AuthCodeError() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Error de autenticación</CardTitle>
          <CardDescription>
            Hubo un problema al procesar tu inicio de sesión. Por favor, intenta de nuevo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => navigate('/')}
            className="w-full"
          >
            Volver al inicio
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="w-full"
          >
            Intentar de nuevo
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}