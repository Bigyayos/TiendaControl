import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Euro, TrendingUp, Target, Store, Users, Clock } from "lucide-react";
import { SalesChart } from "@/components/charts/sales-chart";
import { StoreChart } from "@/components/charts/store-chart";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: stores = [] } = useQuery({
    queryKey: ['/api/stores'],
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['/api/sales'],
  });

  // Prepare chart data with real store performance
  const salesChartData = [
    { name: 'Ayala', ventas: 5780, objetivos: 35000 },
    { name: 'San Sebastian', ventas: 3170, objetivos: 28000 },
    { name: 'Sevilla', ventas: 3450, objetivos: 30000 },
    { name: 'Málaga', ventas: 1300, objetivos: 25000 },
    { name: 'Marbella', ventas: 1100, objetivos: 22000 },
    { name: 'Doha', ventas: 6150, objetivos: 32000 },
    { name: 'Perú', ventas: 2650, objetivos: 26000 },
  ];

  const storeChartData = stores.map((store: any) => ({
    name: store.name,
    value: parseFloat(store.monthlyObjective || 0),
  }));

  if (statsLoading) {
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
                  €{stats?.todaysSales?.toLocaleString() || '0'}
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
                  €{stats?.weekSales?.toLocaleString() || '0'}
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
                  €{stats?.monthSales?.toLocaleString() || '0'}
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
                  {stats?.activeStores || 0}
                </p>
                <p className="text-sm text-gray-500">De {stats?.totalStores || 0} total</p>
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
