import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Euro, TrendingUp, Target, Store, Users, Clock } from "lucide-react";
import { SalesChart } from "@/components/charts/sales-chart";
import { StoreChart } from "@/components/charts/store-chart";
import { useStores, useSales, useObjectives } from "@/hooks/use-supabase";

export default function Dashboard() {
  const { data: stores = [], isLoading: storesLoading } = useStores();
  const { data: sales = [], isLoading: salesLoading } = useSales();
  const { data: objectives = [], isLoading: objectivesLoading } = useObjectives();
  
  const isLoading = storesLoading || salesLoading || objectivesLoading;

  // Calculate stats from real data
  const today = new Date();
  const todaySales = sales
    .filter(sale => new Date(sale.date).toDateString() === today.toDateString())
    .reduce((sum, sale) => sum + sale.amount, 0);

  const weekSales = sales
    .filter(sale => {
      const saleDate = new Date(sale.date);
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return saleDate >= weekAgo;
    })
    .reduce((sum, sale) => sum + sale.amount, 0);

  const monthSales = sales
    .filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate.getMonth() === today.getMonth() && 
             saleDate.getFullYear() === today.getFullYear();
    })
    .reduce((sum, sale) => sum + sale.amount, 0);

  const activeStores = stores.filter(store => store.isActive).length;
  const totalStores = stores.length;

  // Obtener objetivo mensual real de la tabla Objetivos para cada tienda
  const getMonthlyObjective = (storeId: number) => {
    const obj = objectives.find(
      (o) => o.storeId === storeId && o.period === "mensual"
    );
    return obj ? obj.target : 0;
  };

  // Prepare chart data with real store performance y objetivos reales
  const salesChartData = stores.map(store => ({
    name: store.name,
    ventas: sales
      .filter(sale => sale.storeId === store.id)
      .reduce((sum, sale) => sum + sale.amount, 0),
    objetivos: getMonthlyObjective(store.id)
  }));

  const storeChartData = stores.map((store: any) => ({
    name: store.name,
    value: getMonthlyObjective(store.id),
  }));

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-pink-25 to-rose-25 min-h-screen">
      <div className="mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-700 to-rose-700 bg-clip-text text-transparent mb-2">Dashboard Principal</h2>
        <p className="text-pink-600">Resumen general de ventas y objetivos</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ventas Hoy</p>
                <p className="text-2xl font-bold text-gray-900">
                  €{todaySales.toLocaleString()}
                </p>
                <p className="text-sm text-success">+12% vs ayer</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Euro className="text-primary" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ventas Semana</p>
                <p className="text-2xl font-bold text-gray-900">
                  €{weekSales.toLocaleString()}
                </p>
                <p className="text-sm text-success">+8% vs anterior</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-success" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ventas Mes</p>
                <p className="text-2xl font-bold text-gray-900">
                  €{monthSales.toLocaleString()}
                </p>
                <p className="text-sm text-warning">74% completado</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Target className="text-warning" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tiendas Activas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeStores}
                </p>
                <p className="text-sm text-gray-500">De {totalStores} total</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Store className="text-purple-600" size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Ventas vs Objetivos (Mensual)</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesChart data={salesChartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Objetivos por Tienda</CardTitle>
          </CardHeader>
          <CardContent>
            <StoreChart data={storeChartData} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sales.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay actividad reciente</p>
            ) : (
              sales.slice(-3).reverse().map((sale: any) => (
                <div key={sale.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Euro className="text-primary" size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Nueva venta registrada
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(sale.date).toLocaleString('es-ES')}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-success">
                    €{parseFloat(sale.amount).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
