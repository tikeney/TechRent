"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import React, { useState, useEffect } from "react";
import { criarChamado, listarEquipamentosDisponiveis } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function AbrirChamadoForm({ className, ...props }) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [equipamento_id, setEquipamento_id] = useState("");
  const [prioridade, setPrioridade] = useState("media");
  const [equipamentos, setEquipamentos] = useState([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [carregandoEquipamentos, setCarregandoEquipamentos] = useState(true);
  const router = useRouter();

  // Buscar equipamentos disponíveis ao montar o componente
  useEffect(() => {
    const carregarEquipamentos = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const dados = await listarEquipamentosDisponiveis(token);
        setEquipamentos(dados);
      } catch (err) {
        setErro("Erro ao carregar equipamentos disponíveis");
        console.error(err);
      } finally {
        setCarregandoEquipamentos(false);
      }
    };

    carregarEquipamentos();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    // Validação
    if (!titulo.trim()) {
      setErro("Título é obrigatório");
      setCarregando(false);
      return;
    }

    if (!descricao.trim()) {
      setErro("Descrição é obrigatória");
      setCarregando(false);
      return;
    }

    if (!equipamento_id) {
      setErro("Selecione um equipamento");
      setCarregando(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const dados = await criarChamado(token, {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        equipamento_id: parseInt(equipamento_id),
        prioridade,
      });

      // Sucesso!
      toast.success("Chamado aberto com sucesso!", {
        description: `Seu chamado #${dados.id} foi criado e está aguardando atendimento.`,
      });

      // Limpar formulário
      setTitulo("");
      setDescricao("");
      setEquipamento_id("");
      setPrioridade("media");

      // Redirecionar para página de chamados após 2 segundos
      setTimeout(() => {
        router.push("/cliente/meus-chamados");
      }, 2000);
    } catch (err) {
      setErro(err.message);
      toast.error("Erro ao abrir chamado", {
        description: err.message,
      });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Abrir Novo Chamado</CardTitle>
          <CardDescription>
            Descreva o problema com seu equipamento para que possamos ajudá-lo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {erro && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm mb-4">
                  {erro}
                </div>
              )}

              <Field>
                <FieldLabel htmlFor="titulo">Título do Problema *</FieldLabel>
                <Input
                  id="titulo"
                  type="text"
                  placeholder="Ex: Notebook não liga"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  disabled={carregando}
                />
                <FieldDescription>
                  Breve descrição do problema
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="equipamento">Equipamento *</FieldLabel>
                {carregandoEquipamentos ? (
                  <div className="w-full px-3 py-2 border border-zinc-200 rounded-md bg-zinc-50 text-zinc-500">
                    Carregando equipamentos...
                  </div>
                ) : equipamentos.length === 0 ? (
                  <div className="w-full px-3 py-2 border border-yellow-200 rounded-md bg-yellow-50 text-yellow-700">
                    Nenhum equipamento disponível no momento
                  </div>
                ) : (
                  <select
                    id="equipamento"
                    className="w-full px-3 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                    value={equipamento_id}
                    onChange={(e) => setEquipamento_id(e.target.value)}
                    disabled={carregando}
                  >
                    <option value="">Selecione um equipamento</option>
                    {equipamentos.map((equip) => (
                      <option key={equip.id} value={equip.id}>
                        {equip.nome} {equip.categoria ? `(${equip.categoria})` : ""}{" "}
                        {equip.patrimonio ? `- Patrimônio: ${equip.patrimonio}` : ""}
                      </option>
                    ))}
                  </select>
                )}
                <FieldDescription>
                  Selecione o equipamento com problema
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="descricao">Descrição Detalhada *</FieldLabel>
                <textarea
                  id="descricao"
                  placeholder="Descreva o problema em detalhes..."
                  required
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  disabled={carregando}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed min-h-[120px] resize-vertical"
                />
                <FieldDescription>
                  Forneça o máximo de detalhes possível para acelerar o atendimento
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="prioridade">Prioridade</FieldLabel>
                <select
                  id="prioridade"
                  className="w-full px-3 py-2 border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  value={prioridade}
                  onChange={(e) => setPrioridade(e.target.value)}
                  disabled={carregando}
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                </select>
                <FieldDescription>
                  Selecione a urgência do problema
                </FieldDescription>
              </Field>

              <Field>
                <Button type="submit" disabled={carregando || carregandoEquipamentos}>
                  {carregando ? "Abrindo chamado..." : "Abrir Chamado"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
