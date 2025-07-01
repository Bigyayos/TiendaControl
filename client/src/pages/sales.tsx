import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { SaleForm } from "@/components/forms/sale-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Sale, InsertSale, Store, Employee } from "@shared/schema";

export default function Sales() {
  const [filterStore, setFilterStore] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>("");
  const { toast } = useToast();

  const { data: sales = [], isLoading: salesLoading } = useQuery({
    queryKey: ['/api/sales'],
  });

  const { data: stores = [] } = useQuery({
    queryKey: ['/api/stores'],
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['/api/employees'],
  });

  const createSaleMutation = useMutation({
    mutationFn: async (data: InsertSale) => {
      await apiRequest('POST', '/api/sales', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Éxito",
        description: "Venta registrada correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo registrar la venta",
        variant: "destructive",
      });
    },
  });

  const deleteSaleMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/sales/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Éxito",
        description: "Venta eliminada correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la venta",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: InsertSale) => {
    createSaleMutation.mutate(data);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta venta?')) {
      deleteSaleMutation.mutate(id);
    }
  };

  // Filter sales
  const filteredSales = sales.filter((sale: Sale) => {
    const matchesStore = !filterStore || filterStore === "all" || sale.storeId.toString() === filterStore;
    const matchesDate = !filterDate || 
      new Date(sale.date).toISOString().split('T')[0] === filterDate;
    return matchesStore && matchesDate;
  });

  // Get store and employee names for display
  const getStoreName = (storeId: number) => {
    const store = stores.find((s: Store) => s.id === storeId);
    return store?.name || 'Tienda desconocida';
  };

  const getEmployeeName = (employeeId: number | null) => {
    if (!employeeId) return 'N/A';
    const employee = employees.find((e: Employee) => e.id === employeeId);
    return employee?.name || 'Empleado desconocido';
  };

  if (salesLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Registro de Ventas</h2>
        <p className="text-gray-600">Ingresa y gestiona las ventas diarias, semanales y mensuales</p>
      </div>

      {/* Sales Entry Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Nueva Venta</CardTitle>
        </CardHeader>
        <CardContent>
          <SaleForm
            stores={stores}
            employees={employees}
            onSubmit={handleSubmit}
            isLoading={createSaleMutation.isPending}
          />
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Ventas Recientes</CardTitle>
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
              
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-40"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSales.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay ventas registradas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tienda</TableHead>
                    <TableHead>Importe</TableHead>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale: Sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>
                        {new Date(sale.date).toLocaleDateString('es-ES')}
                      </TableCell>
                      <TableCell>{getStoreName(sale.storeId)}</TableCell>
                      <TableCell className="font-medium">
                        €{parseFloat(sale.amount).toLocaleString()}
                      </TableCell>
                      <TableCell>{getEmployeeName(sale.employeeId)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-blue-800"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-danger hover:text-red-800"
                            onClick={() => handleDelete(sale.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
