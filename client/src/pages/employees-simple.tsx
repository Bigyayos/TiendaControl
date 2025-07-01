import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Employee {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  tienda_id: number;
  rol: string;
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

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    tienda_id: "",
    rol: "vendedor",
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
      
      // Cargar empleados
      const { data: employeesData, error: employeesError } = await supabase
        .from('Empleados')
        .select('*')
        .order('id');
      
      if (employeesError) throw employeesError;
      
      // Cargar tiendas
      const { data: storesData, error: storesError } = await supabase
        .from('Tiendas')
        .select('*')
        .order('id');
      
      if (storesError) throw storesError;
      
      setEmployees(employeesData || []);
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
      if (editingEmployee) {
        // Actualizar empleado
        const { error } = await supabase
          .from('Empleados')
          .update({
            nombre: formData.nombre,
            apellidos: formData.apellidos,
            email: formData.email,
            tienda_id: formData.tienda_id ? parseInt(formData.tienda_id) : null,
            rol: formData.rol,
            activo: formData.activo
          })
          .eq('id', editingEmployee.id);
        
        if (error) throw error;
        
        toast({
          title: "Éxito",
          description: "Empleado actualizado correctamente",
        });
      } else {
        // Crear empleado
        const { error } = await supabase
          .from('Empleados')
          .insert({
            nombre: formData.nombre,
            apellidos: formData.apellidos,
            email: formData.email,
            tienda_id: formData.tienda_id ? parseInt(formData.tienda_id) : null,
            rol: formData.rol,
            activo: formData.activo
          });
        
        if (error) throw error;
        
        toast({
          title: "Éxito",
          description: "Empleado creado correctamente",
        });
      }
      
      setIsDialogOpen(false);
      setEditingEmployee(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error guardando empleado:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el empleado",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      nombre: employee.nombre,
      apellidos: employee.apellidos,
      email: employee.email,
      tienda_id: employee.tienda_id?.toString() || "",
      rol: employee.rol,
      activo: employee.activo
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este empleado?')) return;
    
    try {
      const { error } = await supabase
        .from('Empleados')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Éxito",
        description: "Empleado eliminado correctamente",
      });
      
      loadData();
    } catch (error) {
      console.error('Error eliminando empleado:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el empleado",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      apellidos: "",
      email: "",
      tienda_id: "",
      rol: "vendedor",
      activo: true
    });
  };

  const openNewDialog = () => {
    setEditingEmployee(null);
    resetForm();
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando empleados...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Empleados</h1>
          <p className="text-muted-foreground">
            Gestiona los empleados de todas las tiendas
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Empleado
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingEmployee ? "Editar Empleado" : "Nuevo Empleado"}
              </DialogTitle>
              <DialogDescription>
                {editingEmployee 
                  ? "Modifica los datos del empleado seleccionado."
                  : "Completa los datos para crear un nuevo empleado."
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="apellidos">Apellidos</Label>
                  <Input
                    id="apellidos"
                    value={formData.apellidos}
                    onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="rol">Rol</Label>
                <Select 
                  value={formData.rol} 
                  onValueChange={(value) => setFormData({...formData, rol: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vendedor">Vendedor</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
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
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="activo"
                  checked={formData.activo}
                  onCheckedChange={(checked) => setFormData({...formData, activo: checked})}
                />
                <Label htmlFor="activo">Empleado activo</Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingEmployee ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {employees.map((employee) => {
          const store = stores.find(s => s.id === employee.tienda_id);
          return (
            <Card key={employee.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{employee.nombre} {employee.apellidos}</span>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(employee)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(employee.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  {employee.email}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Rol:</span>
                    <span className="text-sm font-medium capitalize">{employee.rol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tienda:</span>
                    <span className="text-sm font-medium">{store?.nombre || 'Sin asignar'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Estado:</span>
                    <span className={`text-sm font-medium ${employee.activo ? 'text-green-600' : 'text-red-600'}`}>
                      {employee.activo ? 'Activo' : 'Inactivo'}
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