import React, { useState } from "react";
import moment from "moment";
import RegistroConsumoEnergia from "./RegistroConsumoEnergia";

function MonitoramentoConsumoEnergia() {
  const [periodos, setPeriodos] = useState([
    {
      dataLeituraAtual: "",
      dataProximaLeitura: "",
      consumoMensalDesejado: "",
      historicoLeituras: [],
      resumo: {},
    },
  ]);
  const [editingPeriodoIndex, setEditingPeriodoIndex] = useState(null);
  const [showRegistroConsumo, setShowRegistroConsumo] = useState(false);
  const [dataLeituraAtual, setDataLeituraAtual] = useState("");
  const [dataProximaLeitura, setDataProximaLeitura] = useState("");
  const [consumoMensalDesejado, setConsumoMensalDesejado] = useState("");
  const [periodoEditado, setPeriodoEditado] = useState(null);

  const handleAddPeriodo = () => {
    if (!dataLeituraAtual || !dataProximaLeitura || !consumoMensalDesejado) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    const novoPeriodo = {
      dataLeituraAtual,
      dataProximaLeitura,
      consumoMensalDesejado,
      historicoLeituras: [],
      resumo: {
        periodo: "",
        diasEntreLeituras: "",
        consumoMensal: 0,
        consumoMensalDesejado: 0,
        valorKwhDiarioDesejado: 0,
        valorKwhDiarioProximo: 0,
      },
    };

    setPeriodos([...periodos, novoPeriodo]);

    setDataLeituraAtual("");
    setDataProximaLeitura("");
    setConsumoMensalDesejado("");
  };

  const handleEditPeriodo = (index) => {
    setEditingPeriodoIndex(index);
    setPeriodoEditado({
      ...periodos[index], // Armazena os dados do período editado
      index: index, // Armazena o índice do período editado
    });
    setShowRegistroConsumo(true); // Mostra o componente de edição
  };

  const handleDeletePeriodo = (index) => {
    const novosPeriodos = [...periodos];
    novosPeriodos.splice(index, 1);
    setPeriodos(novosPeriodos);
  };

  const handleBackToList = () => {
    setShowRegistroConsumo(false);
    setEditingPeriodoIndex(null);
  };

  const handleUpdatePeriodoEditado = (periodoEditado) => {
    const novosPeriodos = [...periodos];
    novosPeriodos[editingPeriodoIndex] = periodoEditado;
    setPeriodos(novosPeriodos);
    setEditingPeriodoIndex(null);
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
          {!showRegistroConsumo && (
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
          {showRegistroConsumo &&
            editingPeriodoIndex === index && ( // Renderiza o componente apenas para o período editado
              <>
                <button onClick={handleBackToList}>Voltar</button>
                <RegistroConsumoEnergia
                  dataInicial={periodos[periodoEditado.index].dataLeituraAtual}
                  dataFinal={periodos[periodoEditado.index].dataProximaLeitura}
                  consumoMensalDesejado={
                    periodos[periodoEditado.index].consumoMensalDesejado
                  }
                  periodoEditado={periodoEditado}
                  updatePeriodoEditado={handleUpdatePeriodoEditado}
                  setShowRegistroConsumo={setShowRegistroConsumo} // Passando a função setShowRegistroConsumo como propriedade
                />
              </>
            )}
        </div>
      ))}
    </div>
  );
}

export default MonitoramentoConsumoEnergia;
