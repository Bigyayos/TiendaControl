import { AlertCircle, Database, Settings } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ConnectionError() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-red-500" />
            Error de Conexión a la Base de Datos
          </CardTitle>
          <CardDescription>
            La aplicación no puede conectarse a Supabase porque faltan las variables de entorno.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Configuración Requerida</AlertTitle>
            <AlertDescription>
              Para que la aplicación funcione correctamente, necesitas configurar las variables de entorno en Netlify.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <h4 className="font-medium">Variables de entorno necesarias:</h4>
            <div className="bg-gray-100 p-3 rounded text-sm font-mono">
              <div>VITE_SUPABASE_URL = https://lmitonmckoomqcorgnkj.supabase.co</div>
              <div>VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Cómo configurar en Netlify:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Ve a tu panel de Netlify</li>
              <li>Selecciona tu sitio (almaenpena.netlify.app)</li>
              <li>Ve a "Site settings" → "Environment variables"</li>
              <li>Agrega las variables de entorno mostradas arriba</li>
              <li>Guarda y haz un redeploy</li>
            </ol>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Recargar Página
            </Button>
            <Button onClick={() => window.open('https://app.netlify.com', '_blank')}>
              <Settings className="mr-2 h-4 w-4" />
              Ir a Netlify
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 