
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calculator, DollarSign, FileText } from "lucide-react";

export default function Salary() {
  const [grossSalary, setGrossSalary] = useState(0);
  const [dependents, setDependents] = useState(0);
  const [otherDeductions, setOtherDeductions] = useState(0);
  const [calculations, setCalculations] = useState<any>(null);

  const calculateSalary = () => {
    // Cálculos baseados na CLT (valores de 2024)
    const inss = calculateINSS(grossSalary);
    const irrf = calculateIRRF(grossSalary, inss, dependents);
    const fgts = grossSalary * 0.08; // 8% do salário bruto
    
    const totalDeductions = inss + irrf + otherDeductions;
    const netSalary = grossSalary - totalDeductions;

    setCalculations({
      grossSalary,
      inss,
      irrf,
      fgts,
      otherDeductions,
      totalDeductions,
      netSalary,
      dependents
    });
  };

  const calculateINSS = (salary: number) => {
    // Tabela INSS 2024
    if (salary <= 1412) return salary * 0.075;
    if (salary <= 2666.68) return (1412 * 0.075) + ((salary - 1412) * 0.09);
    if (salary <= 4000.03) return (1412 * 0.075) + (1254.68 * 0.09) + ((salary - 2666.68) * 0.12);
    if (salary <= 7786.02) return (1412 * 0.075) + (1254.68 * 0.09) + (1333.35 * 0.12) + ((salary - 4000.03) * 0.14);
    return 908.85; // Teto do INSS
  };

  const calculateIRRF = (salary: number, inss: number, deps: number) => {
    const taxableIncome = salary - inss - (deps * 189.59); // Dedução por dependente
    
    if (taxableIncome <= 2112) return 0;
    if (taxableIncome <= 2826.65) return (taxableIncome * 0.075) - 158.40;
    if (taxableIncome <= 3751.05) return (taxableIncome * 0.15) - 370.40;
    if (taxableIncome <= 4664.68) return (taxableIncome * 0.225) - 651.73;
    return (taxableIncome * 0.275) - 884.96;
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Cálculo de Salário</h1>
        <p className="text-muted-foreground">Calcule seu salário líquido com base na CLT</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Formulário de Entrada */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Dados do Salário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="gross-salary">Salário Bruto (R$)</Label>
              <Input
                id="gross-salary"
                type="number"
                step="0.01"
                value={grossSalary}
                onChange={(e) => setGrossSalary(Number(e.target.value))}
                placeholder="5000.00"
              />
            </div>
            <div>
              <Label htmlFor="dependents">Número de Dependentes</Label>
              <Input
                id="dependents"
                type="number"
                value={dependents}
                onChange={(e) => setDependents(Number(e.target.value))}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="other-deductions">Outras Deduções (R$)</Label>
              <Input
                id="other-deductions"
                type="number"
                step="0.01"
                value={otherDeductions}
                onChange={(e) => setOtherDeductions(Number(e.target.value))}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Ex: Vale transporte, vale refeição, plano de saúde, etc.
              </p>
            </div>
            <Button onClick={calculateSalary} className="w-full">
              Calcular Salário Líquido
            </Button>
          </CardContent>
        </Card>

        {/* Resultado do Cálculo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resultado do Cálculo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {calculations ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Salário Bruto:</span>
                    <span className="font-bold text-lg">
                      R$ {calculations.grossSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-red-600">Descontos:</h4>
                  
                  <div className="flex justify-between">
                    <span>INSS:</span>
                    <span className="text-red-600">
                      -R$ {calculations.inss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>IRRF:</span>
                    <span className="text-red-600">
                      -R$ {calculations.irrf.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  {calculations.otherDeductions > 0 && (
                    <div className="flex justify-between">
                      <span>Outras Deduções:</span>
                      <span className="text-red-600">
                        -R$ {calculations.otherDeductions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-medium">
                      <span>Total de Descontos:</span>
                      <span className="text-red-600">
                        -R$ {calculations.totalDeductions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-green-600">Benefícios:</h4>
                  <div className="flex justify-between">
                    <span>FGTS (8%):</span>
                    <span className="text-green-600">
                      +R$ {calculations.fgts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Salário Líquido:</span>
                    <span className="font-bold text-xl text-green-600">
                      R$ {calculations.netSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {calculations.dependents > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <Badge variant="outline">
                      {calculations.dependents} dependente{calculations.dependents > 1 ? 's' : ''} declarado{calculations.dependents > 1 ? 's' : ''}
                    </Badge>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Preencha os dados e clique em "Calcular" para ver o resultado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Importantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Tabela INSS 2024:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>Até R$ 1.412,00: 7,5%</li>
                <li>De R$ 1.412,01 a R$ 2.666,68: 9%</li>
                <li>De R$ 2.666,69 a R$ 4.000,03: 12%</li>
                <li>De R$ 4.000,04 a R$ 7.786,02: 14%</li>
                <li>Teto: R$ 908,85</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Tabela IRRF 2024:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>Até R$ 2.112,00: Isento</li>
                <li>De R$ 2.112,01 a R$ 2.826,65: 7,5%</li>
                <li>De R$ 2.826,66 a R$ 3.751,05: 15%</li>
                <li>De R$ 3.751,06 a R$ 4.664,68: 22,5%</li>
                <li>Acima de R$ 4.664,68: 27,5%</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
