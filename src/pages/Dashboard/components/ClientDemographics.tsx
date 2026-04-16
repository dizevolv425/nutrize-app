import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FaMale, FaFemale, FaUsers, FaSpinner } from "react-icons/fa";
import { useAuth } from "../../../hooks/useAuth";
import { getClientsByNutritionist } from "../../../services/clientService";
import "./ClientDemographics.css";

export const ClientDemographics: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [genderData, setGenderData] = useState<
    Array<{ name: string; value: number; color: string }>
  >([]);
  const [ageData, setAgeData] = useState<
    Array<{ faixa: string; quantidade: number }>
  >([]);
  const [totalClients, setTotalClients] = useState(0);
  const [womenCount, setWomenCount] = useState(0);
  const [menCount, setMenCount] = useState(0);

  useEffect(() => {
    const loadDemographics = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        const clients = await getClientsByNutritionist(user.uid);

        // Calcular estatísticas de gênero
        const women = clients.filter(
          (c) => c.gender === "feminino"
        ).length;
        const men = clients.filter((c) => c.gender === "masculino").length;
        const other = clients.filter((c) => c.gender === "outro").length;
        const total = clients.length;

        const womenPercent = total > 0 ? Math.round((women / total) * 100) : 0;
        const menPercent = total > 0 ? Math.round((men / total) * 100) : 0;
        const otherPercent = total > 0 ? Math.round((other / total) * 100) : 0;

        const genderDataArray = [
          { name: "Mulheres", value: womenPercent, color: "#ec4899" },
          { name: "Homens", value: menPercent, color: "#3b82f6" },
        ];

        if (otherPercent > 0) {
          genderDataArray.push({
            name: "Outros",
            value: otherPercent,
            color: "#8b5cf6",
          });
        }

        // Calcular estatísticas de idade
        const today = new Date();
        const ageGroups: Record<string, number> = {
          "18-25": 0,
          "26-35": 0,
          "36-45": 0,
          "46-55": 0,
          "56+": 0,
        };

        clients.forEach((client) => {
          if (!client.birthDate) return;

          const birthDate = new Date(client.birthDate);
          const age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          const dayDiff = today.getDate() - birthDate.getDate();
          const actualAge =
            monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

          if (actualAge >= 18 && actualAge <= 25) {
            ageGroups["18-25"]++;
          } else if (actualAge >= 26 && actualAge <= 35) {
            ageGroups["26-35"]++;
          } else if (actualAge >= 36 && actualAge <= 45) {
            ageGroups["36-45"]++;
          } else if (actualAge >= 46 && actualAge <= 55) {
            ageGroups["46-55"]++;
          } else if (actualAge >= 56) {
            ageGroups["56+"]++;
          }
        });

        const ageDataArray = Object.entries(ageGroups).map(([faixa, quantidade]) => ({
          faixa,
          quantidade,
        }));

        setGenderData(genderDataArray);
        setAgeData(ageDataArray);
        setTotalClients(total);
        setWomenCount(womenPercent);
        setMenCount(menPercent);
      } catch (error) {
        console.error("Erro ao carregar demografia de clientes:", error);
        setGenderData([]);
        setAgeData([]);
        setTotalClients(0);
        setWomenCount(0);
        setMenCount(0);
      } finally {
        setLoading(false);
      }
    };

    loadDemographics();
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="client-demographics">
        <div className="client-demographics__loading">
          <FaSpinner className="fa-spin" size={24} />
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="client-demographics">
      {/* Cards de resumo */}
      <div className="client-demographics__cards">
        <div className="client-demographics__card client-demographics__card--total">
          <FaUsers size={24} className="client-demographics__card-icon" />
          <p className="client-demographics__card-label">Total de Pacientes</p>
          <p className="client-demographics__card-value">{totalClients}</p>
        </div>

        <div className="client-demographics__card client-demographics__card--female">
          <FaFemale size={24} className="client-demographics__card-icon" />
          <p className="client-demographics__card-label">Mulheres</p>
          <p className="client-demographics__card-value">{womenCount}%</p>
        </div>

        <div className="client-demographics__card client-demographics__card--male">
          <FaMale size={24} className="client-demographics__card-icon" />
          <p className="client-demographics__card-label">Homens</p>
          <p className="client-demographics__card-value">{menCount}%</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="client-demographics__charts">
        {/* Gráfico de pizza - Gênero */}
        <div>
          <h3 className="client-demographics__chart-title">
            Distribuição por Gênero
          </h3>
          <ResponsiveContainer width="100%" height={250} minWidth={280}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de barras - Faixa Etária */}
        <div>
          <h3 className="client-demographics__chart-title">
            Distribuição por Faixa Etária
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="faixa"
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value: number) => [
                  `${value} pacientes`,
                  "Quantidade",
                ]}
              />
              <Bar
                dataKey="quantidade"
                fill="#667eea"
                radius={[8, 8, 0, 0]}
                name="Pacientes"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
