import React, { useState, useEffect } from 'react';
import moment from 'moment';
import 'moment/locale/pt-br'; // Defina o idioma para português do Brasil

function RegistroConsumoEnergia() {
  const [valorAtualLeitura, setValorAtualLeitura] = useState('');
  const [valorKWHDia, setValorKWHDia] = useState('');
  const [historicoLeituras, setHistoricoLeituras] = useState([]);
  const [editarAtualLeitura, setEditarAtualLeitura] = useState(true);
  const [consumoMensal, setConsumoMensal] = useState(0);

  useEffect(() => {
    // Calcular o consumo mensal sempre que o histórico de leituras for alterado
    const consumoMensalTotal = historicoLeituras.reduce((total, leitura) => {
      return total + parseFloat(leitura.kwhDiario);
    }, 0);
    setConsumoMensal(consumoMensalTotal);
  }, [historicoLeituras]);

  const handleAtualLeituraChange = (event) => {
    setValorAtualLeitura(event.target.value);
  };

  const handleValorKWHDiaChange = (event) => {
    setValorKWHDia(event.target.value);
  };

  const registrarLeitura = () => {
    // Obter a data e hora atual
    const dataHoraAtual = moment().format('LLLL');

    // Verificar se o valor da última leitura é maior que o valor atual (apenas para o primeiro registro)
    if (historicoLeituras.length === 0 && parseFloat(valorAtualLeitura) >= parseFloat(valorKWHDia)) {
      alert('O valor do KWH da última leitura deve ser menor que o valor do KWH atual no primeiro registro.');
      return;
    }

    // Calcular a diferença do KWH diário
    let diferencaKWH = 0;
    let valorKWHAnterior = 0;
    if (historicoLeituras.length === 0) {
      // Primeira leitura, calcular em relação à última leitura
      diferencaKWH = parseFloat(valorKWHDia) - parseFloat(valorAtualLeitura);
      valorKWHAnterior = parseFloat(valorAtualLeitura);
    } else {
      // A partir do segundo registro, calcular em relação ao último registro informado
      const ultimoRegistro = historicoLeituras[historicoLeituras.length - 1];
      if (parseFloat(valorKWHDia) <= parseFloat(ultimoRegistro.valorKWHDia)) {
        alert(`O valor do KWH atual (${valorKWHDia}) deve ser maior que o valor do KWH atual anterior (${ultimoRegistro.valorKWHDia}).`);
        return; // Encerre a função sem registrar a leitura
      }
      diferencaKWH = parseFloat(valorKWHDia) - parseFloat(ultimoRegistro.valorKWHDia);
      valorKWHAnterior = parseFloat(ultimoRegistro.valorKWHDia);
    }

    // Criar um objeto com os dados da leitura
    const leitura = {
      dataHora: dataHoraAtual,
      valorKWHDia,
      valorKWHAnterior,
      kwhDiario: diferencaKWH.toFixed(2),
    };

    // Atualizar o histórico de leituras
    setHistoricoLeituras([...historicoLeituras, leitura]);

    // Limpar os campos de entrada
    setValorKWHDia('');

    // Se estiver editando a última leitura, limpar também o campo de última leitura
    if (editarAtualLeitura) {
      setValorAtualLeitura('');
      setEditarAtualLeitura(false);
    }
  };

  const handleEditarLeitura = (index) => {
    const leituraEditada = historicoLeituras[index];
    setValorAtualLeitura(leituraEditada.valorAtualLeitura);
    setValorKWHDia(leituraEditada.valorKWHDia);

    // Remova a leitura editada do histórico
    const novoHistorico = [...historicoLeituras];
    novoHistorico.splice(index, 1);
    setHistoricoLeituras(novoHistorico);
  };

  const handleExcluirLeitura = (index) => {
    const novoHistorico = [...historicoLeituras];
    novoHistorico.splice(index, 1);
    setHistoricoLeituras(novoHistorico);
  };

  const handleEditarAtualLeitura = () => {
    setValorAtualLeitura('');
    setValorKWHDia('');
    setHistoricoLeituras([]);
    setEditarAtualLeitura(true);
  };

  return (
    <div className="RegistroConsumoEnergia">
      <h1>Registro de Consumo de Energia Diário</h1>

      <div>
        <label>
          Valor do KWH da Leitura Atual:
          <input 
            type="number" 
            value={valorAtualLeitura} 
            onChange={handleAtualLeituraChange} 
            disabled={!editarAtualLeitura && historicoLeituras.length > 0} 
          />
        </label>
      </div>

      <div>
        <label>
          Valor do KWH do Dia:
          <input type="number" value={valorKWHDia} onChange={handleValorKWHDiaChange} />
        </label>
      </div>

      <button onClick={registrarLeitura}>Registrar Leitura</button>

      {historicoLeituras.length > 0 && (
        <div>
          <button onClick={handleEditarAtualLeitura}>Editar Última Leitura</button>
        </div>
      )}

      <div>
        <h2>Histórico de Leituras diárias</h2>
        <ul>
          {historicoLeituras.map((leitura, index) => (
            <li key={index}>
              {leitura.dataHora} - KWH Atual: {leitura.valorKWHDia}, KWH Anterior: {leitura.valorKWHAnterior}, KWH Diário: {leitura.kwhDiario}
              <button onClick={() => handleEditarLeitura(index)}>Editar</button>
              <button onClick={() => handleExcluirLeitura(index)}>Excluir</button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Consumo Mensal Atual</h2>
        <p>{consumoMensal.toFixed(2)}</p>
      </div>
    </div>
  );
}

export default RegistroConsumoEnergia;
