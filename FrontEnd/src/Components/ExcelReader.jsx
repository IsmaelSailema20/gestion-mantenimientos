import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import SuccessModal from "./SuccessModal";
import ErrorModal from "./ErrorModal";

const ExcelReader = forwardRef((_, ref) => {
  const fileInputRef = useRef();
  const [successModalData, setSuccessModalData] = useState({
    titulo: "",
    mensaje: "",
  });
  const [errorModalData, setErrorModalData] = useState({
    titulo: "",
    mensaje: "",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modelosInfo, setModelosInfo] = useState({});
  const requiredFields = {
    Marca: "marca",
    Modelo: "modelo",
    "Tipo de Activo": "tipoActivo",
    "Número de serie": "numeroSerie",
    "Proceso de compra": "procesoCompra",
    Proveedor: "proveedor",
    Bloque: "bloque",
    Laboratorio: "laboratorio",
    Estado: "estado",
    Encargado: "encargado",
    Especificaciones: "especificaciones",
    Observaciones: "observaciones",
    Componentes: "componentes",
  };

  useImperativeHandle(ref, () => ({
    triggerFileUpload: () => {
      fileInputRef.current.click();
    },
  }));
  useEffect(() => {
    const fetchModelosInfo = async () => {
      try {
        const response = await axios.get("http://localhost:5000/modelos-info");
        const modeloTipoMap = {};
        response.data.forEach((modelo) => {
          modeloTipoMap[modelo.modelo.trim().toLowerCase()] = modelo.tipo
            .trim()
            .toLowerCase();
        });
        setModelosInfo(modeloTipoMap);
      } catch (error) {
        console.error("Error al obtener la información de los modelos:", error);
      }
    };

    fetchModelosInfo();
  }, []);
  useEffect(() => {
    if (showSuccessModal || showErrorModal) {
      const timer = setTimeout(() => {
        window.location.reload(); // Recargar la pagina porque no se porque no
        //se resetea el stado del componente para que siga funcionando normalmente
      }, 3003);

      return () => clearTimeout(timer);
    }
  }, [showSuccessModal, showErrorModal]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const binaryStr = event.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      // Asegurar que las columnas vacías también estén presentes
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const columns = Object.keys(jsonData[0] || {});
      const missingFields = Object.keys(requiredFields).filter(
        (field) => !columns.includes(field)
      );

      if (missingFields.length > 0) {
        setErrorModalData({
          titulo: "Error de Validación",
          mensaje: `El archivo no contiene los campos requeridos: ${missingFields.join(
            ", "
          )}`,
        });
        setShowErrorModal(true);
        return;
      }

      const transformedData = jsonData.map((row) => {
        const transformedRow = {};
        for (const [excelField, variableName] of Object.entries(
          requiredFields
        )) {
          const matchingKey = Object.keys(row).find(
            (key) =>
              key.trim().toLowerCase() === excelField.trim().toLowerCase()
          );
          transformedRow[variableName] = matchingKey ? row[matchingKey] : null;
        }
        return transformedRow;
      });

      sendDataToServer(transformedData);
    };

    reader.readAsBinaryString(file);
  };
  const validateData = (data) => {
    const errors = [];
    data.forEach((row, index) => {
      const modelo = row.modelo ? row.modelo.trim().toLowerCase() : null;
      const tipo = modelosInfo[modelo]; // Busca el tipo basado en el modelo

      if (
        tipo === "cpu" && // Valida si el tipo es "cpu"
        (!row.componentes || row.componentes.trim() === "")
      ) {
        errors.push(
          `Error en fila ${
            index + 1
          }: El campo 'Componentes' es obligatorio para activos de tipo CPU.`
        );
      }
    });
    return errors;
  };
  const sendDataToServer = (dataToSend) => {
    const validationErrors = validateData(dataToSend);
    if (validationErrors.length > 0) {
      setErrorModalData({
        titulo: "Errores de Validación",
        mensaje: validationErrors.join("\n"),
      });
      setShowErrorModal(true);
      return;
    }

    axios
      .post("http://localhost:5000/registrarLoteActivos", dataToSend)
      .then((response) => {
        if (response.data.resultados.every((resultado) => resultado.success)) {
          setSuccessModalData({
            titulo: "Registro Exitoso",
            mensaje: "Todos los activos se han registrado correctamente.",
          });
          setShowSuccessModal(true);
        } else {
          const errores = response.data.resultados
            .map((registro) => {
              if (registro.error) {
                if (registro.error.includes("Duplicate entry")) {
                  return `El activo ${registro.activo} ya existe.`;
                }
                return `Activo ${registro.activo}: ${registro.error}`;
              }
              return null;
            })
            .filter((error) => error !== null)
            .join("\n");

          setErrorModalData({
            titulo: "Error al Registrar",
            mensaje: `No se pudieron registrar algunos activos:\n${errores}`,
          });
          setShowErrorModal(true);
        }
      })
      .catch(() => {
        setErrorModalData({
          titulo: "Error de Servidor",
          mensaje: "Hubo un error al intentar registrar los activos.",
        });
        setShowErrorModal(true);
      });
  };

  return (
    <>
      <input
        type="file"
        accept=".xlsx, .xls"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleFileUpload}
      />
      {showSuccessModal && (
        <SuccessModal
          titulo={successModalData.titulo}
          mensaje={successModalData.mensaje}
        />
      )}
      {showErrorModal && (
        <ErrorModal
          titulo={errorModalData.titulo}
          mensaje={errorModalData.mensaje}
        />
      )}
    </>
  );
});

ExcelReader.displayName = "ExcelReader";

export default ExcelReader;
