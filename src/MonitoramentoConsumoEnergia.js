import React, { useState } from "react";
import moment from "moment";
import RegistroConsumoEnergia from "./RegistroConsumoEnergia"; // Importe o componente

function MonitoramentoConsumoEnergia() {
  const [periodos, setPeriodos] = useState([]);
  const [editingPeriodoIndex, setEditingPeriodoIndex] = useState(null);
  const [showRegistroConsumo, setShowRegistroConsumo] = useState(false); // Estado para controlar a visibilidade do RegistroConsumoEnergia
  const [dataLeituraAtual, setDataLeituraAtual] = useState("");
  const [dataProximaLeitura, setDataProximaLeitura] = useState("");
  const [consumoMensalDesejado, setConsumoMensalDesejado] = useState("");
  const [periodoEditado, setPeriodoEditado] = useState(null); // Estado para armazenar o período sendo editado

  const handleAddPeriodo = () => {
    // Verifica se todos os campos foram preenchidos
    if (!dataLeituraAtual || !dataProximaLeitura || !consumoMensalDesejado) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    const novoPeriodo = {
      dataLeituraAtual,
      dataProximaLeitura,
      consumoMensalDesejado,
    };

    setPeriodos([...periodos, novoPeriodo]);

    // Limpa os campos após adicionar o período
    setDataLeituraAtual("");
    setDataProximaLeitura("");
    setConsumoMensalDesejado("");
  };

  const handleEditPeriodo = (index) => {
    setEditingPeriodoIndex(index);
    const periodoSelecionado = periodos[index];
    setDataLeituraAtual(periodoSelecionado.dataLeituraAtual);
    setDataProximaLeitura(periodoSelecionado.dataProximaLeitura);
    setConsumoMensalDesejado(periodoSelecionado.consumoMensalDesejado);
    setPeriodoEditado(periodoSelecionado); // Armazena as informações do período sendo editado
    setShowRegistroConsumo(true); // Defina showRegistroConsumo como true ao editar um período
  };

  const handleDeletePeriodo = (index) => {
    const novosPeriodos = [...periodos];
    novosPeriodos.splice(index, 1);
    setPeriodos(novosPeriodos);
  };

  const handleBackToList = () => {
    setShowRegistroConsumo(false);
    setEditingPeriodoIndex(null); // Limpar o índice de edição ao voltar para a lista
  };

  return (
    <div>
      {!editingPeriodoIndex && !showRegistroConsumo && (
        <>
          <h2>Criar um novo monitoramento de consumo de energia</h2>
          <div>
            <label>Data da Leitura Atual:</label>
            <input
              type="date"
              value={dataLeituraAtual}
              onChange={(e) => setDataLeituraAtual(e.target.value)}
            />
          </div>
          <div>
            <label>Data da Próxima Leitura:</label>
            <input
              type="date"
              value={dataProximaLeitura}
              onChange={(e) => setDataProximaLeitura(e.target.value)}
            />
          </div>
          <div>
            <label>Consumo mensal desejado (em KWH):</label>
            <input
              type="number"
              value={consumoMensalDesejado}
              onChange={(e) => setConsumoMensalDesejado(e.target.value)}
            />
          </div>
          <button onClick={handleAddPeriodo}>Criar</button>
        </>
      )}
      {periodos.map((periodo, index) => (
        <div key={index}>
          {editingPeriodoIndex !== index && !showRegistroConsumo && (
            <>
              <h2>Período:</h2>
              <p>
                {moment(periodo.dataLeituraAtual).format("DD/MM/YYYY")} -{" "}
                {moment(periodo.dataProximaLeitura).format("DD/MM/YYYY")}
              </p>
              <button onClick={() => handleEditPeriodo(index)}>Editar</button>
              <button onClick={() => handleDeletePeriodo(index)}>
                Excluir
              </button>
            </>
          )}
          {editingPeriodoIndex === index && !showRegistroConsumo && (
            <RegistroConsumoEnergia
              dataInicial={dataLeituraAtual}
              dataFinal={dataProximaLeitura}
              consumoMensalDesejado={consumoMensalDesejado}
            />
          )}
        </div>
      ))}
      {showRegistroConsumo && (
        <>
          <button onClick={handleBackToList}>Voltar</button>
          <RegistroConsumoEnergia
            dataInicial={dataLeituraAtual}
            dataFinal={dataProximaLeitura}
            consumoMensalDesejado={consumoMensalDesejado}
            periodoEditado={periodoEditado} // Passe as informações do período sendo editado
          />
        </>
      )}
    </div>
  );
}

export default MonitoramentoConsumoEnergia;
