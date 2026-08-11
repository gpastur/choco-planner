Set shell = CreateObject("WScript.Shell")
shell.CurrentDirectory = "C:\Users\Usuario\OneDrive - TRONADOR S.A.C\Documents\Planificación\testplan-main\choco-planner-app"
shell.Run """C:\Program Files\nodejs\node.exe"" preview-server.cjs", 0, False
