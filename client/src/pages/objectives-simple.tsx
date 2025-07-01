import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Objective {
  id: number;
  tienda_id: number;
  tipo: string;
  monto: number;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
  created_at: string;
}

interface Store {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  activa: boolean;
  created_at: string;
}

export default function ObjectivesPage() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
  const [formData, setFormData] = useState({
    tienda_id: "",
    tipo: "mensual",
    monto: "",
    fecha_inicio: "",
    fecha_fin: "",
    activo: true
  });
  const { toast } = useToast();

  // Cargar datos
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar objetivos
      const { data: objectivesData, error: objectivesError } = await supabase
        .from('Objetivos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (objectivesError) throw objectivesError;
      
      // Cargar tiendas
      const { data: storesData, error: storesError } = await supabase
        .from('Tiendas')
        .select('*')
        .order('id');
      
      if (storesError) throw storesError;
      
      setObjectives(objectivesData || []);
      setStores(storesData || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingObjective) {
        // Actualizar objetivo
        const { error } = await supabase
          .from('Objetivos')
          .update({
            tienda_id: parseInt(formData.tienda_id),
            tipo: formData.tipo,
            monto: parseFloat(formData.monto),
            fecha_inicio: formData.fecha_inicio,
            fecha_fin: formData.fecha_fin,
            activo: formData.activo
          })
          .eq('id', editingObjective.id);
        
        if (error) throw error;
        
        toast({
          title: "Éxito",
          description: "Objetivo actualizado correctamente",
        });
      } else {
        // Crear objetivo
        const { error } = await supabase
          .from('Objetivos')
          .insert({
            tienda_id: parseInt(formData.tienda_id),
            tipo: formData.tipo,
            monto: parseFloat(formData.monto),
            fecha_inicio: formData.fecha_inicio,
            fecha_fin: formData.fecha_fin,
            activo: formData.activo
          });
        
        if (error) throw error;
        
        toast({
          title: "Éxito",
          description: "Objetivo creado correctamente",
        });
      }
      
      setIsDialogOpen(false);
      setEditingObjective(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error guardando objetivo:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el objetivo",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (objective: Objective) => {
    setEditingObjective(objective);
    setFormData({
      tienda_id: objective.tienda_id.toString(),
      tipo: objective.tipo,
      monto: objective.monto.toString(),
      fecha_inicio: objective.fecha_inicio,
      fecha_fin: objective.fecha_fin,
      activo: objective.activo
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este objetivo?')) return;
    
    try {
      const { error } = await supabase
        .from('Objetivos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Éxito",
        description: "Objetivo eliminado correctamente",
      });
      
      loadData();
    } catch (error) {
      console.error('Error eliminando objetivo:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el objetivo",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      tienda_id: "",
      tipo: "mensual",
      monto: "",
      fecha_inicio: "",
      fecha_fin: "",
      activo: true
    });
  };

  const openNewDialog = () => {
    setEditingObjective(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando objetivos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Objetivos</h1>
          <p className="text-muted-foreground">
            Gestiona los objetivos de ventas por tienda
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Objetivo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingObjective ? "Editar Objetivo" : "Nuevo Objetivo"}
              </DialogTitle>
              <DialogDescription>
                {editingObjective 
                  ? "Modifica los datos del objetivo seleccionado."
                  : "Completa los datos para crear un nuevo objetivo."
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="tienda">Tienda</Label>
                <Select 
                  value={formData.tienda_id} 
                  onValueChange={(value) => setFormData({...formData, tienda_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tienda" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id.toString()}>
                        {store.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="tipo">Tipo de Objetivo</Label>
                <Select 
                  value={formData.tipo} 
                  onValueChange={(value) => setFormData({...formData, tipo: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diario">Diario</SelectItem>
                    <SelectItem value="semanal">Semanal</SelectItem>
                    <SelectItem value="mensual">Mensual</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="monto">Monto Objetivo (€)</Label>
                <Input
                  id="monto"
                  type="number"
                  step="0.01"
                  value={formData.monto}
                  onChange={(e) => setFormData({...formData, monto: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
                  <Input
                    id="fecha_inicio"
                    type="date"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fecha_fin">Fecha de Fin</Label>
                  <Input
                    id="fecha_fin"
                    type="date"
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingObjective ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {objectives.map((objective) => {
          const store = stores.find(s => s.id === objective.tienda_id);
          return (
            <Card key={objective.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Objetivo {objective.tipo}</span>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(objective)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(objective.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  {store?.nombre || 'Tienda no encontrada'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Monto:</span>
                    <span className="text-sm font-medium">{formatCurrency(objective.monto)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Período:</span>
                    <span className="text-sm font-medium capitalize">{objective.tipo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Inicio:</span>
                    <span className="text-sm font-medium">{formatDate(objective.fecha_inicio)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Fin:</span>
                    <span className="text-sm font-medium">{formatDate(objective.fecha_fin)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Estado:</span>
                    <span className={`text-sm font-medium ${objective.activo ? 'text-green-600' : 'text-red-600'}`}>
                      {objective.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
} 