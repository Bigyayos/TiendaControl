import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Users, UserCheck, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmployeeForm } from "@/components/forms/employee-form";
import { useToast } from "@/hooks/use-toast";
import { useEmployees, useStores, useSales, type Employee, type Store } from "@/hooks/use-supabase";
import { supabase } from "@/lib/supabase";

export default function Employees() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterStore, setFilterStore] = useState<string>("");
  const [filterRole, setFilterRole] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: employees = [], isLoading } = useEmployees();
  const { data: stores = [] } = useStores();
  const { data: sales = [] } = useSales();

  const createEmployeeMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: newEmployee, error } = await supabase
        .from('Empleados')
        .insert({
          nombre: data.name,
          email: data.email,
          rol: data.role,
          tienda_id: data.storeId,
          activo: data.isActive
        })
        .select()
        .single();
      
      if (error) throw error;
      return newEmployee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setIsFormOpen(false);
      setSelectedEmployee(undefined);
      toast({
        title: "Éxito",
        description: "Empleado creado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el empleado",
        variant: "destructive",
      });
    },
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!selectedEmployee) throw new Error('No employee selected');
      const { data: updatedEmployee, error } = await supabase
        .from('Empleados')
        .update({
          nombre: data.name,
          email: data.email,
          rol: data.role,
          tienda_id: data.storeId,
          activo: data.isActive
        })
        .eq('id', selectedEmployee.id)
        .select()
        .single();
      
      if (error) throw error;
      return updatedEmployee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setIsFormOpen(false);
      setSelectedEmployee(undefined);
      toast({
        title: "Éxito",
        description: "Empleado actualizado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el empleado",
        variant: "destructive",
      });
    },
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('Empleados')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: "Éxito",
        description: "Empleado eliminado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el empleado",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: any) => {
    if (selectedEmployee) {
      updateEmployeeMutation.mutate(data);
    } else {
      createEmployeeMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este empleado?')) {
      deleteEmployeeMutation.mutate(id);
    }
  };

  const openEditForm = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsFormOpen(true);
  };

  const openCreateForm = () => {
    setSelectedEmployee(undefined);
    setIsFormOpen(true);
  };

  // Filter employees
  const filteredEmployees = employees.filter((employee: Employee) => {
    const matchesStore = !filterStore || filterStore === "all" || employee.storeId?.toString() === filterStore;
    const matchesRole = !filterRole || filterRole === "all" || employee.role === filterRole;
    return matchesStore && matchesRole;
  });

  // Calculate stats
  const totalEmployees = employees.length;
  const managers = employees.filter((emp: Employee) => emp.role === 'manager').length;
  const sellers = employees.filter((emp: Employee) => emp.role === 'vendedor').length;
  const activeEmployees = employees.filter((emp: Employee) => emp.isActive).length;

  // Get employee monthly sales
  const getEmployeeMonthlySales = (employeeId: number) => {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const employeeSales = sales.filter((sale: any) => {
      const saleDate = new Date(sale.date);
      return sale.employeeId === employeeId && saleDate >= thisMonth;
    });

    return employeeSales.reduce((sum: number, sale: any) => sum + parseFloat(sale.amount), 0);
  };

  const getStoreName = (storeId: number | null) => {
    if (!storeId) return 'Sin asignar';
    const store = stores.find((s: Store) => s.id === storeId);
    return store?.name || 'Tienda desconocida';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Gestión de Empleados</h2>
          <p className="text-gray-600">Administra empleados y su asignación a tiendas</p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateForm} className="mt-4 sm:mt-0">
              <Plus className="mr-2" size={16} />
              Nuevo Empleado
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedEmployee ? 'Editar' : 'Nuevo'} Empleado
              </DialogTitle>
              <DialogDescription>
                {selectedEmployee ? 'Modifica los datos del empleado seleccionado.' : 'Completa la información para crear un nuevo empleado.'}
              </DialogDescription>
            </DialogHeader>
            <EmployeeForm
              employee={selectedEmployee}
              stores={stores}
              onSubmit={handleSubmit}
              isLoading={createEmployeeMutation.isPending || updateEmployeeMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Employee Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Empleados</p>
                <p className="text-2xl font-bold text-gray-900">{totalEmployees}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-primary" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Managers</p>
                <p className="text-2xl font-bold text-gray-900">{managers}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="text-success" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vendedores</p>
                <p className="text-2xl font-bold text-gray-900">{sellers}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="text-purple-600" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-gray-900">{activeEmployees}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="text-warning" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Lista de Empleados</CardTitle>
            <div className="flex space-x-2 mt-4 sm:mt-0">
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
              
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Todos los roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="vendedor">Vendedor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No hay empleados registrados</p>
              <Button onClick={openCreateForm}>
                <Plus className="mr-2" size={16} />
                Crear primer empleado
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Tienda</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Ventas Este Mes</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee: Employee) => {
                    const monthlySales = getEmployeeMonthlySales(employee.id);
                    
                    return (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback className="bg-primary text-white">
                                {getInitials(employee.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {employee.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {employee.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStoreName(employee.storeId)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={employee.role === 'manager' ? 'default' : 'secondary'}
                          >
                            {employee.role === 'manager' ? 'Manager' : 'Vendedor'}
                          </Badge>
                        </TableCell>
                        <TableCell>€{monthlySales.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={employee.isActive ? 'default' : 'secondary'}>
                            {employee.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:text-blue-800"
                              onClick={() => openEditForm(employee)}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-danger hover:text-red-800"
                              onClick={() => handleDelete(employee.id)}
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
    </div>
  );
}
