import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Calendar, CalendarDays, CalendarRange } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ObjectiveForm } from "@/components/forms/objective-form";
import { useToast } from "@/hooks/use-toast";
import { useObjectives, useStores, useSales, type Objective, type Store } from "@/hooks/use-supabase";
import { supabase } from "@/lib/supabase";

export default function Objectives() {
  const [filterPeriod, setFilterPeriod] = useState<string>("all");
  const [filterStore, setFilterStore] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
  const [deletingObjective, setDeletingObjective] = useState<Objective | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: objectives = [], isLoading } = useObjectives();
  const { data: stores = [] } = useStores();
  const { data: sales = [] } = useSales();

  const createObjectiveMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: newObjective, error } = await supabase
        .from('Objetivos')
        .insert({
          tienda_id: data.storeId,
          tipo: data.month,
          monto: data.target,
          fecha_inicio: new Date().toISOString().split('T')[0],
          fecha_fin: new Date().toISOString().split('T')[0],
          activo: true
        })
        .select()
        .single();
      
      if (error) throw error;
      return newObjective;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      setIsFormOpen(false);
      toast({
        title: "Éxito",
        description: "Objetivo creado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el objetivo",
        variant: "destructive",
      });
    },
  });

  const updateObjectiveMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const { data: updatedObjective, error } = await supabase
        .from('Objetivos')
        .update({
          tienda_id: data.storeId,
          tipo: data.month,
          monto: data.target,
          fecha_inicio: new Date().toISOString().split('T')[0],
          fecha_fin: new Date().toISOString().split('T')[0],
          activo: true
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return updatedObjective;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      setEditingObjective(null);
      toast({
        title: "Éxito",
        description: "Objetivo actualizado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el objetivo",
        variant: "destructive",
      });
    },
  });

  const deleteObjectiveMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('Objetivos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      toast({
        title: "Éxito",
        description: "Objetivo eliminado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el objetivo",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: any) => {
    if (editingObjective) {
      updateObjectiveMutation.mutate({ id: editingObjective.id, data });
    } else {
      createObjectiveMutation.mutate(data);
    }
  };

  const handleEdit = (objective: Objective) => {
    setEditingObjective(objective);
  };

  const handleCancelEdit = () => {
    setEditingObjective(null);
  };

  const handleDelete = (objective: Objective) => {
    deleteObjectiveMutation.mutate(objective.id);
    setDeletingObjective(null);
  };

  const handleCancelDelete = () => {
    setDeletingObjective(null);
  };

  // Filter objectives
  const filteredObjectives = objectives.filter((objective: Objective) => {
    const matchesPeriod = filterPeriod === "all" || objective.period === filterPeriod;
    const matchesStore = !filterStore || filterStore === "all" || objective.storeId.toString() === filterStore;
    return matchesPeriod && matchesStore;
  });

  // Calculate progress for each objective
  const getObjectiveProgress = (objective: Objective) => {
    const objectiveSales = sales.filter((sale: any) => {
      const saleDate = new Date(sale.date);
      const startDate = new Date(objective.startDate);
      const endDate = new Date(objective.endDate);
      return sale.storeId === objective.storeId && 
             saleDate >= startDate && 
             saleDate <= endDate;
    });

    const currentSales = objectiveSales.reduce((sum: number, sale: any) => 
      sum + parseFloat(sale.amount), 0
    );
    
    const target = parseFloat(objective.target);
    const progress = target > 0 ? (currentSales / target) * 100 : 0;
    
    return { currentSales, progress };
  };

  const getStoreName = (storeId: number) => {
    const store = stores.find((s: Store) => s.id === storeId);
    return store?.name || 'Tienda desconocida';
  };

  const getStatusBadge = (progress: number) => {
    if (progress >= 100) {
      return <Badge className="bg-success text-white">Completado</Badge>;
    } else if (progress >= 50) {
      return <Badge className="bg-warning text-white">En Progreso</Badge>;
    } else {
      return <Badge className="bg-danger text-white">Pendiente</Badge>;
    }
  };

  // Calculate summary stats
  const dailyObjectives = objectives.filter((obj: Objective) => obj.period === 'diario');
  const weeklyObjectives = objectives.filter((obj: Objective) => obj.period === 'semanal');
  const monthlyObjectives = objectives.filter((obj: Objective) => obj.period === 'mensual');

  const getCompletedCount = (objs: Objective[]) => {
    return objs.filter(obj => getObjectiveProgress(obj).progress >= 100).length;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Gestión de Objetivos</h2>
          <p className="text-gray-600">Define y monitorea objetivos por tienda y período</p>
        </div>
        
        <Dialog open={isFormOpen || editingObjective !== null} onOpenChange={(open) => {
          if (!open) {
            setIsFormOpen(false);
            setEditingObjective(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button className="mt-4 sm:mt-0">
              <Plus className="mr-2" size={16} />
              Nuevo Objetivo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingObjective ? 'Editar Objetivo' : 'Nuevo Objetivo'}
              </DialogTitle>
            </DialogHeader>
            <ObjectiveForm
              stores={stores}
              onSubmit={handleSubmit}
              isLoading={createObjectiveMutation.isPending || updateObjectiveMutation.isPending}
              initialData={editingObjective}
              onCancel={handleCancelEdit}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Objectives Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Objetivos Diarios</h3>
              <Calendar className="text-primary" size={20} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Completados</span>
                <span className="text-sm font-medium text-success">
                  {getCompletedCount(dailyObjectives)}/{dailyObjectives.length}
                </span>
              </div>
              <Progress 
                value={dailyObjectives.length > 0 ? (getCompletedCount(dailyObjectives) / dailyObjectives.length) * 100 : 0} 
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Objetivos Semanales</h3>
              <CalendarDays className="text-warning" size={20} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Completados</span>
                <span className="text-sm font-medium text-warning">
                  {getCompletedCount(weeklyObjectives)}/{weeklyObjectives.length}
                </span>
              </div>
              <Progress 
                value={weeklyObjectives.length > 0 ? (getCompletedCount(weeklyObjectives) / weeklyObjectives.length) * 100 : 0} 
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Objetivos Mensuales</h3>
              <CalendarRange className="text-danger" size={20} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Completados</span>
                <span className="text-sm font-medium text-danger">
                  {getCompletedCount(monthlyObjectives)}/{monthlyObjectives.length}
                </span>
              </div>
              <Progress 
                value={monthlyObjectives.length > 0 ? (getCompletedCount(monthlyObjectives) / monthlyObjectives.length) * 100 : 0} 
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Objectives Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Objetivos Actuales</CardTitle>
            <div className="flex space-x-2 mt-4 sm:mt-0">
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Todos los períodos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los períodos</SelectItem>
                  <SelectItem value="diario">Diario</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="mensual">Mensual</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterStore} onValueChange={setFilterStore}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Todas las tiendas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las tiendas</SelectItem>
                  {stores.map((store: Store) => (
                    <SelectItem key={store.id} value={store.id.toString()}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredObjectives.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No hay objetivos registrados</p>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="mr-2" size={16} />
                Crear primer objetivo
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tienda</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Objetivo</TableHead>
                    <TableHead>Actual</TableHead>
                    <TableHead>Progreso</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredObjectives.map((objective: Objective) => {
                    const { currentSales, progress } = getObjectiveProgress(objective);
                    const periodText = objective.period 
                      ? `${objective.period.charAt(0).toUpperCase() + objective.period.slice(1)} ${new Date(objective.startDate).toLocaleDateString('es-ES')}`
                      : `Período ${new Date(objective.startDate).toLocaleDateString('es-ES')}`;
                    
                    return (
                      <TableRow key={objective.id}>
                        <TableCell className="font-medium">
                          {getStoreName(objective.storeId)}
                        </TableCell>
                        <TableCell>{periodText}</TableCell>
                        <TableCell>€{parseFloat(objective.target).toLocaleString()}</TableCell>
                        <TableCell>€{currentSales.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress value={Math.min(progress, 100)} className="w-16" />
                            <span className="text-sm text-gray-600">
                              {Math.round(progress)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(progress)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:text-blue-800"
                              onClick={() => handleEdit(objective)}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-danger hover:text-red-800"
                              onClick={() => setDeletingObjective(objective)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deletingObjective !== null} onOpenChange={(open) => {
        if (!open) setDeletingObjective(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar el objetivo de{" "}
              <strong>{deletingObjective ? getStoreName(deletingObjective.storeId) : ""}</strong>?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={handleCancelDelete}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deletingObjective && handleDelete(deletingObjective)}
              disabled={deleteObjectiveMutation.isPending}
            >
              {deleteObjectiveMutation.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
