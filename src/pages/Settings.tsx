
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { User, Bell, Shield, Palette, Database, Download, Upload } from "lucide-react";
import { useUserSettings, useCreateOrUpdateUserSettings } from "@/hooks/useUserSettings";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Settings() {
  const { data: settings } = useUserSettings();
  const updateSettings = useCreateOrUpdateUserSettings();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    currency: "brl",
    date_format: "dd/mm/yyyy",
    theme: "system",
    notifications_bills: true,
    notifications_budget: true,
    notifications_monthly: false,
    notifications_investments: true,
    animations_enabled: true,
  });

  const [profileData, setProfileData] = useState({
    email: user?.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        currency: settings.currency,
        date_format: settings.date_format,
        theme: settings.theme,
        notifications_bills: settings.notifications_bills,
        notifications_budget: settings.notifications_budget,
        notifications_monthly: settings.notifications_monthly,
        notifications_investments: settings.notifications_investments,
        animations_enabled: settings.animations_enabled,
      });
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    await updateSettings.mutateAsync(formData);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("As senhas não conferem");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast.success("Senha alterada com sucesso!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error.message || "Erro ao alterar senha");
    }
  };

  const handleExportData = async () => {
    try {
      // Buscar todos os dados do usuário
      const [transactions, accounts, categories, bills, investments] = await Promise.all([
        supabase.from('transactions').select('*'),
        supabase.from('accounts').select('*'),
        supabase.from('categories').select('*'),
        supabase.from('bills').select('*'),
        supabase.from('investments').select('*'),
      ]);

      const exportData = {
        transactions: transactions.data,
        accounts: accounts.data,
        categories: categories.data,
        bills: bills.data,
        investments: investments.data,
        exported_at: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financas-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Backup criado com sucesso!");
    } catch (error) {
      toast.error("Erro ao criar backup");
    }
  };

  const handleClearAllData = async () => {
    try {
      // Excluir dados em ordem (respeitando foreign keys)
      await Promise.all([
        supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('bills').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('investments').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      ]);

      await Promise.all([
        supabase.from('accounts').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('credit_cards').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      ]);

      toast.success("Todos os dados foram excluídos!");
    } catch (error) {
      toast.error("Erro ao excluir dados");
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Personalize sua experiência no aplicativo</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Aparência
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Dados
          </TabsTrigger>
        </TabsList>

        {/* Perfil */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={profileData.email} disabled />
                <p className="text-sm text-muted-foreground">
                  Para alterar seu e-mail, entre em contato com o suporte.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Moeda Padrão</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a moeda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brl">Real Brasileiro (R$)</SelectItem>
                    <SelectItem value="usd">Dólar Americano ($)</SelectItem>
                    <SelectItem value="eur">Euro (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveSettings} disabled={updateSettings.isPending}>
                {updateSettings.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificações */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Faturas Vencendo</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações sobre faturas próximas do vencimento
                  </p>
                </div>
                <Switch 
                  checked={formData.notifications_bills}
                  onCheckedChange={(checked) => setFormData({ ...formData, notifications_bills: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Metas de Orçamento</Label>
                  <p className="text-sm text-muted-foreground">
                    Alertas quando se aproximar do limite do orçamento
                  </p>
                </div>
                <Switch 
                  checked={formData.notifications_budget}
                  onCheckedChange={(checked) => setFormData({ ...formData, notifications_budget: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Resumo Mensal</Label>
                  <p className="text-sm text-muted-foreground">
                    Relatório automático no final de cada mês
                  </p>
                </div>
                <Switch 
                  checked={formData.notifications_monthly}
                  onCheckedChange={(checked) => setFormData({ ...formData, notifications_monthly: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Investimentos</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificações sobre mudanças significativas nos investimentos
                  </p>
                </div>
                <Switch 
                  checked={formData.notifications_investments}
                  onCheckedChange={(checked) => setFormData({ ...formData, notifications_investments: checked })}
                />
              </div>
              <Button onClick={handleSaveSettings} disabled={updateSettings.isPending}>
                {updateSettings.isPending ? "Salvando..." : "Salvar Preferências"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aparência */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personalização da Interface</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tema</Label>
                <Select value={formData.theme} onValueChange={(value) => setFormData({ ...formData, theme: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Formato de Data</Label>
                <Select value={formData.date_format} onValueChange={(value) => setFormData({ ...formData, date_format: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd/mm/yyyy">DD/MM/AAAA</SelectItem>
                    <SelectItem value="mm/dd/yyyy">MM/DD/AAAA</SelectItem>
                    <SelectItem value="yyyy-mm-dd">AAAA-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Animações</Label>
                  <p className="text-sm text-muted-foreground">
                    Ativar transições e animações na interface
                  </p>
                </div>
                <Switch 
                  checked={formData.animations_enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, animations_enabled: checked })}
                />
              </div>
              <Button onClick={handleSaveSettings} disabled={updateSettings.isPending}>
                {updateSettings.isPending ? "Salvando..." : "Salvar Aparência"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segurança */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Segurança da Conta</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova Senha</Label>
                  <Input 
                    id="new-password" 
                    type="password" 
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit">Alterar Senha</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dados */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Dados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Backup dos Dados</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Baixe uma cópia de segurança de todos os seus dados
                  </p>
                  <Button variant="outline" onClick={handleExportData} className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Fazer Backup
                  </Button>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium text-red-600">Zona de Perigo</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Ações irreversíveis que afetam permanentemente seus dados
                  </p>
                  <div className="space-y-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="text-red-600 border-red-600">
                          Limpar Todos os Dados
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Limpar Todos os Dados</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação irá excluir permanentemente todas as suas transações, contas, categorias e outros dados. Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleClearAllData}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Confirmar Exclusão
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
