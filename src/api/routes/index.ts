import { Router } from "express";
import emergenciaDesastres from "./emergencia-desastres.route";
import bibliotecaCongresoNacional from "./biblioteca-congreso-nacional.route";

const router = Router();

router.use("/emergencia-desastres", emergenciaDesastres);
router.use("/biblioteca-congreso-nacional", bibliotecaCongresoNacional);

export default router;
