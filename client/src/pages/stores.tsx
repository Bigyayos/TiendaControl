import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Eye, MapPin, User, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { StoreForm } from "@/components/forms/store-form";
import { useToast } from "@/hooks/use-toast";
import { useStores, type Store } from "@/hooks/use-supabase";
import { supabase } from "@/lib/supabase";

export default function Stores() {
  const [selectedStore, setSelectedStore] = useState<Store | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewStore, setViewStore] = useState<Store | undefined>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stores = [], isLoading } = useStores();

  const createStoreMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: newStore, error } = await supabase
        .from('Tiendas')
        .insert({
          nombre: data.name,
          direccion: data.address,
          gerente: data.manager,
          empleados: data.employees,
          activa: data.isActive,
          objetivo_mensual: data.monthlyObjective
        })
        .select()
        .single();
      
      if (error) throw error;
      return newStore;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      setIsFormOpen(false);
      setSelectedStore(undefined);
      toast({
        title: "Éxito",
        description: "Tienda creada correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la tienda",
        variant: "destructive",
      });
    },
  });

  const updateStoreMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!selectedStore) throw new Error('No store selected');
      const { data: updatedStore, error } = await supabase
        .from('Tiendas')
        .update({
          nombre: data.name,
          direccion: data.address,
          gerente: data.manager,
          empleados: data.employees,
          activa: data.isActive,
          objetivo_mensual: data.monthlyObjective
        })
        .eq('id', selectedStore.id)
        .select()
        .single();
      
      if (error) throw error;
      return updatedStore;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      setIsFormOpen(false);
      setSelectedStore(undefined);
      toast({
        title: "Éxito",
        description: "Tienda actualizada correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la tienda",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: any) => {
    if (selectedStore) {
      updateStoreMutation.mutate(data);
    } else {
      createStoreMutation.mutate(data);
    }
  };

  const openEditForm = (store: Store) => {
    setSelectedStore(store);
    setIsFormOpen(true);
  };

  const openCreateForm = () => {
    setSelectedStore(undefined);
    setIsFormOpen(true);
  };

  const openViewModal = (store: Store) => {
    setViewStore(store);
    setIsViewOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Gestión de Tiendas</h2>
          <p className="text-gray-600">Administra todas tus tiendas</p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateForm} className="mt-4 sm:mt-0">
              <Plus className="mr-2" size={16} />
              Nueva Tienda
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedStore ? 'Editar' : 'Nueva'} Tienda
              </DialogTitle>
              <DialogDescription>
                {selectedStore ? 'Modifica los datos de la tienda seleccionada.' : 'Completa la información para crear una nueva tienda.'}
              </DialogDescription>
            </DialogHeader>
            <StoreForm
              store={selectedStore ? {
                ...selectedStore,
                createdAt: selectedStore.createdAt ? new Date(selectedStore.createdAt) : null
              } : undefined}
              onSubmit={handleSubmit}
              isLoading={createStoreMutation.isPending || updateStoreMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 mb-4">No hay tiendas registradas</p>
            <Button onClick={openCreateForm}>
              <Plus className="mr-2" size={16} />
              Crear primera tienda
            </Button>
          </div>
        ) : (
          stores.map((store: Store) => {
            const monthlyObjective = parseFloat(store.monthlyObjective);
            // Mock current sales for progress calculation
            const currentSales = monthlyObjective * 0.65; // 65% of objective
            const progressPercent = monthlyObjective > 0 ? (currentSales / monthlyObjective) * 100 : 0;

            return (
              <Card key={store.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">{store.name}</h3>
                    <Badge variant={store.isActive ? "default" : "secondary"}>
                      {store.isActive ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600 flex items-center">
                      <MapPin className="mr-2 text-gray-400" size={14} />
                      {store.address}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <User className="mr-2 text-gray-400" size={14} />
                      Manager: {store.manager}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Users className="mr-2 text-gray-400" size={14} />
                      {store.employees} empleados
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Ventas del mes</p>
                      <p className="text-lg font-semibold text-gray-900">
                        €{currentSales.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Objetivo</p>
                      <p className="text-lg font-semibold text-gray-900">
                        €{monthlyObjective.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditForm(store)}
                    >
                      <Edit className="mr-1" size={14} />
                      Editar
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => openViewModal(store)}
                    >
                      <Eye className="mr-1" size={14} />
                      Ver
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* View Store Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Eye className="mr-2 text-pink-600" size={20} />
              Detalles de {viewStore?.name}
            </DialogTitle>
            <DialogDescription>
              Información detallada de la tienda y su rendimiento actual.
            </DialogDescription>
          </DialogHeader>
          
          {viewStore && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-pink-800">{viewStore.name}</h3>
                  <Badge variant={viewStore.isActive ? "default" : "secondary"}>
                    {viewStore.isActive ? "Activa" : "Inactiva"}
                  </Badge>
                </div>
                <div className="flex items-center text-pink-600">
                  <MapPin className="mr-2" size={16} />
                  <span>{viewStore.address}</span>
                </div>
              </div>

              {/* Manager and Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-pink-100 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <User className="mr-2 text-pink-600" size={16} />
                    <span className="font-medium text-pink-800">Manager</span>
                  </div>
                  <p className="text-gray-700">{viewStore.manager}</p>
                </div>

                <div className="bg-white border border-pink-100 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Users className="mr-2 text-pink-600" size={16} />
                    <span className="font-medium text-pink-800">Empleados</span>
                  </div>
                  <p className="text-gray-700">{viewStore.employees} empleados</p>
                </div>
              </div>

              {/* Objective and Performance */}
              <div className="bg-white border border-pink-100 rounded-lg p-4">
                <h4 className="font-medium text-pink-800 mb-3">Objetivo Mensual</h4>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-pink-700">
                    €{parseFloat(viewStore.monthlyObjective).toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500">Meta del mes</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div 
                    className="bg-gradient-to-r from-pink-500 to-rose-500 h-3 rounded-full transition-all duration-300" 
                    style={{ width: `65%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progreso actual: 65%</span>
                  <span>€{(parseFloat(viewStore.monthlyObjective) * 0.65).toLocaleString()}</span>
                </div>
              </div>

              {/* Store Info */}
              <div className="bg-white border border-pink-100 rounded-lg p-4">
                <h4 className="font-medium text-pink-800 mb-3">Información General</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha de creación:</span>
                    <span className="text-gray-800">
                      {new Date(viewStore.createdAt).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span className={`font-medium ${viewStore.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {viewStore.isActive ? 'Operativa' : 'Cerrada'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
