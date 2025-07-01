import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FileBarChart, Download, FileText, FileSpreadsheet, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import type { Store, Employee, Sale, Objective } from "@shared/schema";

export default function Reports() {
  const [reportType, setReportType] = useState("sales");
  const [reportPeriod, setReportPeriod] = useState("month");
  const [reportStore, setReportStore] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const { toast } = useToast();

  const { data: stores = [] } = useQuery({
    queryKey: ['/api/stores'],
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['/api/employees'],
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['/api/sales'],
  });

  const { data: objectives = [] } = useQuery({
    queryKey: ['/api/objectives'],
  });

  // Generate report data based on filters
  const generateReportData = () => {
    const now = new Date();
    let startDate = new Date();

    switch (reportPeriod) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // Filter sales by period and store
    const filteredSales = sales.filter((sale: Sale) => {
      const saleDate = new Date(sale.date);
      const matchesPeriod = saleDate >= startDate;
      const matchesStore = !reportStore || reportStore === "all" || sale.storeId.toString() === reportStore;
      return matchesPeriod && matchesStore;
    });

    return filteredSales;
  };

  // Prepare chart data
  const getChartData = () => {
    const filteredSales = generateReportData();
    
    if (reportType === "sales") {
      // Group sales by week for the chart
      const weeklyData: { [key: string]: number } = {};
      
      filteredSales.forEach((sale: Sale) => {
        const saleDate = new Date(sale.date);
        const weekStart = new Date(saleDate);
        weekStart.setDate(saleDate.getDate() - saleDate.getDay());
        const weekKey = `Sem ${Math.ceil(weekStart.getDate() / 7)}`;
        
        weeklyData[weekKey] = (weeklyData[weekKey] || 0) + parseFloat(sale.amount);
      });

      return Object.entries(weeklyData).map(([week, amount]) => ({
        name: week,
        ventas: amount,
      }));
    }

    return [];
  };

  // Get top performers
  const getTopPerformers = () => {
    const filteredSales = generateReportData();
    const employeeSales: { [key: number]: number } = {};

    filteredSales.forEach((sale: Sale) => {
      if (sale.employeeId) {
        employeeSales[sale.employeeId] = (employeeSales[sale.employeeId] || 0) + parseFloat(sale.amount);
      }
    });

    const topPerformers = Object.entries(employeeSales)
      .map(([employeeId, totalSales]) => {
        const employee = employees.find((emp: Employee) => emp.id === parseInt(employeeId));
        const store = stores.find((store: Store) => store.id === employee?.storeId);
        return {
          id: parseInt(employeeId),
          name: employee?.name || 'Empleado desconocido',
          store: store?.name || 'Tienda desconocida',
          sales: totalSales,
        };
      })
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 3);

    return topPerformers;
  };

  const chartData = getChartData();
  const topPerformers = getTopPerformers();

  const handleExport = (format: string) => {
    toast({
      title: "Exportando reporte",
      description: `Generando archivo ${format.toUpperCase()}...`,
    });
    
    // In a real application, this would trigger a download
    setTimeout(() => {
      toast({
        title: "Reporte exportado",
        description: `El archivo ${format.toUpperCase()} se ha descargado correctamente.`,
      });
    }, 2000);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStoreName = (storeId: string) => {
    if (!storeId || storeId === "all") return "Todas las tiendas";
    const store = stores.find((s: Store) => s.id.toString() === storeId);
    return store?.name || "Tienda desconocida";
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    toast({
      title: "Generando reporte",
      description: `Procesando datos de ${reportType} para ${getStoreName(reportStore)}...`,
    });

    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      setReportGenerated(true);
      
      toast({
        title: "Reporte generado",
        description: `Reporte de ${reportType} generado exitosamente`,
      });
    }, 2000);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Reportes y Análisis</h2>
        <p className="text-gray-600">Genera reportes detallados y analiza el rendimiento</p>
      </div>

      {/* Report Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filtros de Reporte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Reporte
              </label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Ventas</SelectItem>
                  <SelectItem value="objectives">Objetivos</SelectItem>
                  <SelectItem value="employees">Empleados</SelectItem>
                  <SelectItem value="stores">Tiendas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período
              </label>
              <Select value={reportPeriod} onValueChange={setReportPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Esta Semana</SelectItem>
                  <SelectItem value="month">Este Mes</SelectItem>
                  <SelectItem value="quarter">Este Trimestre</SelectItem>
                  <SelectItem value="year">Este Año</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tienda
              </label>
              <Select value={reportStore} onValueChange={setReportStore}>
                <SelectTrigger>
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

            <div className="flex items-end">
              <Button 
                className="w-full" 
                onClick={handleGenerateReport}
                disabled={isGenerating}
              >
                <FileBarChart className="mr-2" size={16} />
                {isGenerating ? "Generando..." : "Generar Reporte"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Results */}
      {reportGenerated && (
        <div className="mb-6">
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-4">
            <div className="flex items-center">
              <Trophy className="text-pink-600 mr-3" size={20} />
              <div>
                <h3 className="font-semibold text-pink-800">Reporte Generado</h3>
                <p className="text-pink-600 text-sm">
                  Reporte de {reportType} • {getStoreName(reportStore)} • {reportPeriod === "today" ? "Hoy" : reportPeriod === "week" ? "Esta Semana" : reportPeriod === "month" ? "Este Mes" : reportPeriod === "quarter" ? "Este Trimestre" : "Este Año"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Performance Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {reportType === "sales" ? "Rendimiento de Ventas" : "Datos del Reporte"}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleExport("chart")}
            >
              <Download size={16} />
            </Button>
          </CardHeader>
          <CardContent>
            {reportGenerated && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`€${value.toLocaleString()}`, 'Ventas']} />
                  <Bar dataKey="ventas" fill="hsl(207, 90%, 54%)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <FileBarChart className="mx-auto mb-4" size={48} />
                  <p>{reportGenerated ? "No hay datos para mostrar" : "Presiona 'Generar Reporte' para ver los datos"}</p>
                  <p className="text-sm">
                    {reportGenerated ? "Ajusta los filtros para ver los resultados" : "Configura los filtros y genera el reporte"}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top Performers</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleExport("performers")}
            >
              <Download size={16} />
            </Button>
          </CardHeader>
          <CardContent>
            {reportGenerated && topPerformers.length > 0 ? (
              <div className="space-y-4">
                {topPerformers.map((performer, index) => (
                  <div
                    key={performer.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs
                        ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'}
                      `}>
                        {index + 1}
                      </div>
                      <Avatar>
                        <AvatarFallback className="bg-primary text-white">
                          {getInitials(performer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {performer.name}
                        </p>
                        <p className="text-xs text-gray-500">{performer.store}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      €{performer.sales.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <Trophy className="mx-auto mb-4" size={48} />
                  <p>No hay datos de rendimiento</p>
                  <p className="text-sm">
                    {reportStore ? `Para la tienda: ${getStoreName(reportStore)}` : "Para todas las tiendas"}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Exportar Datos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center px-4 py-8 h-auto border-2 border-dashed border-gray-300 hover:border-primary hover:bg-blue-50 text-gray-600 hover:text-primary transition-colors"
              onClick={() => handleExport("pdf")}
            >
              <FileText className="mb-2" size={32} />
              <div className="text-center">
                <p className="text-sm font-medium">Exportar a PDF</p>
                <p className="text-xs">Reporte completo</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col items-center justify-center px-4 py-8 h-auto border-2 border-dashed border-gray-300 hover:border-success hover:bg-green-50 text-gray-600 hover:text-success transition-colors"
              onClick={() => handleExport("excel")}
            >
              <FileSpreadsheet className="mb-2" size={32} />
              <div className="text-center">
                <p className="text-sm font-medium">Exportar a Excel</p>
                <p className="text-xs">Datos tabulares</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col items-center justify-center px-4 py-8 h-auto border-2 border-dashed border-gray-300 hover:border-warning hover:bg-yellow-50 text-gray-600 hover:text-warning transition-colors"
              onClick={() => handleExport("csv")}
            >
              <FileText className="mb-2" size={32} />
              <div className="text-center">
                <p className="text-sm font-medium">Exportar a CSV</p>
                <p className="text-xs">Formato universal</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
