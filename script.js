local RNUI = { Tabs = {}, ThemeColor = Color3.fromRGB(0, 170, 255) }
local UserInputService = game:GetService("UserInputService")
local TweenService = game:GetService("TweenService")
local LocalPlayer = game:GetService("Players").LocalPlayer

function RNUI:Init(config)
    config = config or {}
    local ScreenGui = Instance.new("ScreenGui")
    ScreenGui.Name = "RNUI_Final"; ScreenGui.Parent = LocalPlayer:WaitForChild("PlayerGui"); ScreenGui.ResetOnSpawn = false

    -- [ FRAME PRINCIPAL ]
    local MainFrame = Instance.new("Frame")
    MainFrame.Size = UDim2.new(0, 380, 0, 260) -- Mais compacto
    MainFrame.Position = UDim2.new(0.5, -190, 0.5, -130)
    MainFrame.BackgroundColor3 = Color3.fromRGB(10, 10, 10)
    MainFrame.Parent = ScreenGui
    Instance.new("UIStroke", MainFrame).Color = RNUI.ThemeColor
    
    local TitleBar = Instance.new("Frame")
    TitleBar.Size = UDim2.new(1, 0, 0, 28); TitleBar.BackgroundColor3 = Color3.fromRGB(20,20,20); TitleBar.Parent = MainFrame

    local Titulo = Instance.new("TextLabel")
    Titulo.Text = config.Title or "RN MENU"; Titulo.Size = UDim2.new(1, -65, 1, 0); Titulo.Position = UDim2.new(0, 10, 0, 0)
    Titulo.TextColor3 = Color3.new(1,1,1); Titulo.Font = "Code"; Titulo.TextXAlignment = "Left"; Titulo.BackgroundTransparency = 1; Titulo.Parent = TitleBar

    -- [ BOTÕES TOPO ]
    local CloseBtn = Instance.new("TextButton")
    CloseBtn.Text = "X"; CloseBtn.Size = UDim2.new(0, 28, 0, 28); CloseBtn.Position = UDim2.new(1, -28, 0, 0)
    CloseBtn.TextColor3 = Color3.new(1,0,0); CloseBtn.BackgroundTransparency = 1; CloseBtn.Parent = TitleBar

    local SettingsBtn = Instance.new("TextButton")
    SettingsBtn.Text = "⚙️"; SettingsBtn.Size = UDim2.new(0, 28, 0, 28); SettingsBtn.Position = UDim2.new(1, -56, 0, 0)
    SettingsBtn.TextColor3 = Color3.new(1,1,1); SettingsBtn.BackgroundTransparency = 1; SettingsBtn.Parent = TitleBar

    -- [ CONTAINERS ]
    local ContentPage = Instance.new("ScrollingFrame")
    ContentPage.Size = UDim2.new(1, -10, 1, -35); ContentPage.Position = UDim2.new(0, 5, 0, 32)
    ContentPage.BackgroundTransparency = 1; ContentPage.ScrollBarThickness = 0; ContentPage.Parent = MainFrame
    local Layout = Instance.new("UIListLayout", ContentPage); Layout.Padding = UDim.new(0, 5)

    -- Auto-ajuste do Scroll
    Layout:GetPropertyChangedSignal("AbsoluteContentSize"):Connect(function()
        ContentPage.CanvasSize = UDim2.new(0, 0, 0, Layout.AbsoluteContentSize.Y + 10)
    end)

    -- Funções da Library
    function RNUI:Separator()
        local s = Instance.new("Frame"); s.Size = UDim2.new(1, -10, 0, 1); s.BackgroundColor3 = Color3.fromRGB(40,40,40); s.Parent = ContentPage
    end

    function RNUI:Label(txt)
        local l = Instance.new("TextLabel"); l.Size = UDim2.new(1, -10, 0, 20); l.Text = txt; l.TextColor3 = Color3.new(0.7,0.7,0.7)
        l.Font = "Code"; l.BackgroundTransparency = 1; l.Parent = ContentPage
    end

    function RNUI:Button(txt, cb)
        local b = Instance.new("TextButton"); b.Size = UDim2.new(1, -10, 0, 30); b.BackgroundColor3 = Color3.fromRGB(25,25,25)
        b.Text = txt; b.TextColor3 = Color3.new(1,1,1); b.Font = "Code"; b.Parent = ContentPage
        b.MouseButton1Click:Connect(cb)
    end

    function RNUI:Toggle(txt, def, cb)
        local state = def
        local t = Instance.new("TextButton"); t.Size = UDim2.new(1, -10, 0, 30); t.BackgroundColor3 = Color3.fromRGB(25,25,25)
        t.Text = txt .. (state and " [ON]" or " [OFF]"); t.TextColor3 = state and RNUI.ThemeColor or Color3.new(1,1,1); t.Parent = ContentPage
        t.MouseButton1Click:Connect(function()
            state = not state; t.Text = txt .. (state and " [ON]" or " [OFF]"); t.TextColor3 = state and RNUI.ThemeColor or Color3.new(1,1,1); cb(state)
        end)
    end

    function RNUI:TextBox(txt, placeholder, cb)
        local f = Instance.new("Frame"); f.Size = UDim2.new(1,-10,0,30); f.BackgroundColor3 = Color3.fromRGB(25,25,25); f.Parent = ContentPage
        local l = Instance.new("TextLabel"); l.Text = txt; l.Size = UDim2.new(0.4,0,1,0); l.BackgroundTransparency = 1; l.TextColor3 = Color3.new(1,1,1); l.Parent = f
        local tb = Instance.new("TextBox"); tb.PlaceholderText = placeholder; tb.Text = ""; tb.Size = UDim2.new(0.6,-5,0.8,0); tb.Position = UDim2.new(0.4,0,0.1,0)
        tb.BackgroundColor3 = Color3.fromRGB(35,35,35); tb.TextColor3 = Color3.new(1,1,1); tb.Parent = f
        tb.FocusLost:Connect(function() cb(tb.Text) end)
    end

    function RNUI:Dropdown(txt, list, def, cb)
        local d = Instance.new("TextButton"); d.Size = UDim2.new(1,-10,0,30); d.BackgroundColor3 = Color3.fromRGB(25,25,25)
        d.Text = txt .. ": " .. (def or "..."); d.TextColor3 = Color3.new(1,1,1); d.Parent = ContentPage
        d.MouseButton1Click:Connect(function()
            -- Lógica simplificada: rotaciona a lista ao clicar
            local idx = table.find(list, def) or 1
            idx = idx % #list + 1
            def = list[idx]
            d.Text = txt .. ": " .. def
            cb(def)
        end)
    end

    -- Drag (Mobile)
    local dragging, dragStart, startPos
    TitleBar.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
            dragging = true; dragStart = input.Position; startPos = MainFrame.Position
        end
    end)
    UserInputService.InputChanged:Connect(function(input)
        if dragging and (input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch) then
            local delta = input.Position - dragStart
            MainFrame.Position = UDim2.new(startPos.X.Scale, startPos.X.Offset + delta.X, startPos.Y.Scale, startPos.Y.Offset + delta.Y)
        end
    end)
    UserInputService.InputEnded:Connect(function() dragging = false end)

    return self
end
return RNUI
