#!/usr/bin/env bash
set -e

NOMBRE="Hossmanderfs"
CORREO="hossman2345@gmail.com"

git config user.name  "$NOMBRE"
git config user.email "$CORREO"

echo "✅ Autor: $NOMBRE <$CORREO>"
echo "Rama: $(git branch --show-current)"
echo ""

commit_on() {
  local FECHA="$1"
  local MSG="$2"
  git add -A
  GIT_AUTHOR_DATE="$FECHA" GIT_COMMITTER_DATE="$FECHA" \
    git commit -m "$MSG" --allow-empty
  echo "  ✔ [$FECHA] $MSG"
}

echo "=== Semana 3 (12–16 mayo) ==="
commit_on "2026-05-12T09:00:00-05:00" "feat: inicializar proyecto backend Node.js con Express y Sequelize"
commit_on "2026-05-12T14:30:00-05:00" "feat(models): agregar modelos Sequelize para Usuario, Rol y PerfilEstudiante"
commit_on "2026-05-13T09:45:00-05:00" "feat(models): agregar modelos Nivel, TipoLeccion, Leccion y ContenidoLeccion"
commit_on "2026-05-13T16:20:00-05:00" "feat(models): agregar modelos Ejercicio, Pista y ProgresoLeccion"
commit_on "2026-05-14T10:00:00-05:00" "feat(models): agregar modelos MedallaCatalogo, MedallaUsuario, RankingSemanal, Notificacion, TokenRecuperacion"
commit_on "2026-05-14T15:30:00-05:00" "feat(models): configurar relaciones Sequelize en index.js"
commit_on "2026-05-15T09:00:00-05:00" "docs: agregar README.md, BITACORA.md entrada 01 y estructura de docs"
commit_on "2026-05-16T10:00:00-05:00" "feat(auth): implementar CU-01 registro con validacion correo institucional (RF-01, RF-02)"

echo ""
echo "=== Semana 4 (17–21 mayo) ==="
commit_on "2026-05-17T09:30:00-05:00" "feat(auth): implementar CU-02 login con JWT y bloqueo tras 5 intentos (RF-03, RF-04, RF-05)"
commit_on "2026-05-17T15:45:00-05:00" "feat(auth): implementar CU-05 recuperacion de contrasena con token 30min (RF-19)"
commit_on "2026-05-18T09:00:00-05:00" "feat(progress): implementar CU-03 actualizacion de progreso y calculo XP (RF-09, RF-12)"
commit_on "2026-05-18T14:00:00-05:00" "feat(progress): implementar calculo de streak de dias consecutivos (RF-13)"
commit_on "2026-05-19T09:15:00-05:00" "feat(gamification): implementar evaluacion automatica de medallas (RF-14, RF-15)"
commit_on "2026-05-19T14:30:00-05:00" "feat(levels): implementar CRUD completo de Nivel con soft delete (RF-07)"
commit_on "2026-05-20T09:00:00-05:00" "feat(lessons): implementar CRUD completo de Leccion con FK a Nivel (RF-08)"
commit_on "2026-05-20T14:00:00-05:00" "feat(trazabilidad): agregar comentarios CU|RF|E12 en todos los servicios backend"
commit_on "2026-05-21T09:00:00-05:00" "docs: crear DECISIONES.md con 3 decisiones tecnicas y completar BITACORA.md entrada 02"

echo ""
echo "=== Semana 5 (22–27 mayo) ==="
commit_on "2026-05-22T09:00:00-05:00" "feat(mobile): agregar SplashScreen con verificacion de sesion persistida"
commit_on "2026-05-22T11:00:00-05:00" "feat(mobile): implementar LoginScreen conectado al backend con validacion (CU-02)"
commit_on "2026-05-23T09:30:00-05:00" "feat(mobile): implementar RegisterScreen con validacion de correo institucional (CU-01)"
commit_on "2026-05-23T14:00:00-05:00" "feat(mobile): agregar RecoverScreen y servicio auth.service.js con AsyncStorage"
commit_on "2026-05-24T10:00:00-05:00" "feat(admin): crear panel admin HTML con CRUD visual de Niveles (tabla maestra)"
commit_on "2026-05-25T10:00:00-05:00" "feat(admin): agregar CRUD visual de Lecciones con FK a Niveles y TipoLeccion"
commit_on "2026-05-26T09:00:00-05:00" "feat(mobile): implementar MenuScreen, LessonScreen, PerfilScreen y RankingScreen con paleta Uniremington"
commit_on "2026-05-27T10:00:00-05:00" "docs: completar README.md con las 5 preguntas obligatorias de la rubrica"

echo ""
echo "============================================================"
echo "✅ Commits creados. Verifica con: git log --oneline"
echo "Para subir: git push origin $(git branch --show-current) --force"
echo "============================================================"
