import React, { useState, useEffect } from "react";
import moment from "moment";
import { db } from "./firebase";
import {
  ref,
  onValue,
  off,
  getDatabase,
  set,
  remove,
  push,
} from "firebase/database";
import RegistroConsumoEnergia from "./RegistroConsumoEnergia";

function MonitoramentoConsumoEnergia() {
  const [periodos, setPeriodos] = useState([]);
  const [editingPeriodoIndex, setEditingPeriodoIndex] = useState(null);
  const [showRegistroConsumo, setShowRegistroConsumo] = useState(false);
  const [dataLeituraAtual, setDataLeituraAtual] = useState("");
  const [dataProximaLeitura, setDataProximaLeitura] = useState("");
  const [consumoMensalDesejado, setConsumoMensalDesejado] = useState("");
  const [periodoEditado, setPeriodoEditado] = useState(null);

  useEffect(() => {
    const periodosRef = ref(db, "periodos");
    onValue(
      periodosRef,
      (snapshot) => {
        const periodosData = snapshot.val();
        const periodosArray = [];
        for (let key in periodosData) {
          periodosArray.push({
            key: key,
            ...periodosData[key],
          });
        }
        setPeriodos(periodosArray);
      },
      (error) => {
        console.log("Erro ao buscar os periodos:", error.message);
      }
    );

    return () => off(periodosRef);
  }, []);

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

    const periodosRef = ref(db, "periodos");

    push(periodosRef, novoPeriodo)
      .then(() => {
        console.log("Novo período adicionado com sucesso!");
      })
      .catch((error) => {
        console.log("Erro ao adicionar novo período:", error.message);
      });

    setDataLeituraAtual("");
    setDataProximaLeitura("");
    setConsumoMensalDesejado("");
  };

  const handleEditPeriodo = (index) => {
    setEditingPeriodoIndex(index);
    const novoPeriodoEditado = {
      ...periodos[index],
      index: index,
    };
    setPeriodoEditado(novoPeriodoEditado);
    setShowRegistroConsumo(true);
  };

  const handleDeletePeriodo = (index) => {
    const periodoKey = periodos[index].key;
    const periodoRef = ref(db, `periodos/${periodoKey}`);
    remove(periodoRef)
      .then(() => {
        console.log("Período excluído com sucesso!");
      })
      .catch((error) => {
        console.log("Erro ao excluir o período:", error.message);
      });
  };

  const handleBackToList = () => {
    setShowRegistroConsumo(false);
    setEditingPeriodoIndex(null);
  };

  const handleUpdatePeriodoEditado = (periodoEditado) => {
    const periodoKey = periodos[editingPeriodoIndex].key;
    set(ref(getDatabase(), `periodos/${periodoKey}`), periodoEditado);
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
          {showRegistroConsumo && editingPeriodoIndex === index && (
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
                setShowRegistroConsumo={setShowRegistroConsumo}
              />
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default MonitoramentoConsumoEnergia;
