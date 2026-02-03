local RNUI = { Tabs = {}, CurrentTab = nil, ThemeColor = Color3.fromRGB(0, 170, 255) }
local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local TweenService = game:GetService("TweenService")
local LocalPlayer = Players.LocalPlayer

local ScreenGui, MainFrame, TabContainer, ContentContainer, FloatBtn, ConfigFrame

function RNUI:Init(config)
    config = config or {}
    
    ScreenGui = Instance.new("ScreenGui")
    ScreenGui.Name = "RNUI_Internal"
    ScreenGui.Parent = LocalPlayer:WaitForChild("PlayerGui")
    ScreenGui.ResetOnSpawn = false

    -- Botão Flutuante
    FloatBtn = Instance.new("TextButton")
    FloatBtn.Size = UDim2.new(0, 45, 0, 45)
    FloatBtn.Position = UDim2.new(0, 10, 0.5, -22)
    FloatBtn.BackgroundColor3 = RNUI.ThemeColor
    FloatBtn.Text = "RN"
    FloatBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
    FloatBtn.Font = Enum.Font.GothamBold
    FloatBtn.Visible = false
    FloatBtn.Parent = ScreenGui
    Instance.new("UICorner", FloatBtn).CornerRadius = UDim.new(1, 0)

    -- Main Frame (Visual Internal)
    MainFrame = Instance.new("Frame")
    MainFrame.Size = UDim2.new(0, 450, 0, 300)
    MainFrame.Position = UDim2.new(0.5, -225, 0.5, -150)
    MainFrame.BackgroundColor3 = Color3.fromRGB(10, 10, 10)
    MainFrame.BorderSizePixel = 0
    MainFrame.Parent = ScreenGui
    
    local Stroke = Instance.new("UIStroke")
    Stroke.Color = RNUI.ThemeColor
    Stroke.Thickness = 1.5
    Stroke.Parent = MainFrame
    Instance.new("UICorner", MainFrame).CornerRadius = UDim.new(0, 4)

    -- Barra de Título
    local TitleBar = Instance.new("Frame")
    TitleBar.Size = UDim2.new(1, 0, 0, 30)
    TitleBar.BackgroundColor3 = Color3.fromRGB(20, 20, 20)
    TitleBar.Parent = MainFrame

    local Titulo = Instance.new("TextLabel")
    Titulo.Size = UDim2.new(1, -100, 1, 0)
    Titulo.Position = UDim2.new(0, 10, 0, 0)
    Titulo.BackgroundTransparency = 1
    Titulo.Text = config.Title or "INTERNAL UI"
    Titulo.TextColor3 = Color3.fromRGB(255, 255, 255)
    Titulo.Font = Enum.Font.Code
    Titulo.TextSize = 14
    Titulo.TextXAlignment = Enum.TextXAlignment.Left
    Titulo.Parent = TitleBar

    -- Botões da Barra (X e Engrenagem)
    local CloseBtn = Instance.new("TextButton")
    CloseBtn.Size = UDim2.new(0, 30, 0, 30)
    CloseBtn.Position = UDim2.new(1, -30, 0, 0)
    CloseBtn.BackgroundTransparency = 1
    CloseBtn.Text = "X"
    CloseBtn.TextColor3 = Color3.fromRGB(255, 80, 80)
    CloseBtn.Parent = TitleBar

    local SettingsBtn = Instance.new("TextButton")
    SettingsBtn.Size = UDim2.new(0, 30, 0, 30)
    SettingsBtn.Position = UDim2.new(1, -60, 0, 0)
    SettingsBtn.BackgroundTransparency = 1
    SettingsBtn.Text = "⚙️"
    SettingsBtn.TextColor3 = Color3.fromRGB(200, 200, 200)
    SettingsBtn.TextSize = 16
    SettingsBtn.Parent = TitleBar

    -- Lógica de fechar/abrir
    CloseBtn.MouseButton1Click:Connect(function()
        MainFrame.Visible = false
        FloatBtn.Visible = true
    end)
    FloatBtn.MouseButton1Click:Connect(function()
        MainFrame.Visible = true
        FloatBtn.Visible = false
    end)

    -- Container de Abas (Lateral)
    TabContainer = Instance.new("ScrollingFrame")
    TabContainer.Size = UDim2.new(0, 110, 1, -35)
    TabContainer.Position = UDim2.new(0, 5, 0, 35)
    TabContainer.BackgroundTransparency = 1
    TabContainer.ScrollBarThickness = 0
    TabContainer.Parent = MainFrame
    Instance.new("UIListLayout", TabContainer).Padding = UDim.new(0, 3)

    ContentContainer = Instance.new("Frame")
    ContentContainer.Size = UDim2.new(1, -125, 1, -40)
    ContentContainer.Position = UDim2.new(0, 120, 0, 35)
    ContentContainer.BackgroundTransparency = 1
    ContentContainer.Parent = MainFrame

    -- ABA DE CONFIGURAÇÃO (Oculta por padrão)
    local ConfigPage = Instance.new("ScrollingFrame")
    ConfigPage.Size = UDim2.new(1, 0, 1, 0)
    ConfigPage.BackgroundTransparency = 0.95
    ConfigPage.BackgroundColor3 = Color3.fromRGB(0,0,0)
    ConfigPage.Visible = false
    ConfigPage.Parent = ContentContainer
    Instance.new("UIListLayout", ConfigPage).Padding = UDim.new(0, 10)

    SettingsBtn.MouseButton1Click:Connect(function()
        for _, v in pairs(ContentContainer:GetChildren()) do v.Visible = false end
        ConfigPage.Visible = true
    end)

    -- Função interna para criar sliders de ajuste da UI
    local function createUISlider(txt, min, max, start, callback)
        local f = Instance.new("Frame")
        f.Size = UDim2.new(1, -10, 0, 40); f.BackgroundTransparency = 1; f.Parent = ConfigPage
        local l = Instance.new("TextLabel")
        l.Text = txt; l.Size = UDim2.new(1,0,0,15); l.TextColor3 = Color3.new(1,1,1); l.BackgroundTransparency = 1; l.Parent = f
        local b = Instance.new("Frame")
        b.Size = UDim2.new(1, 0, 0, 5); b.Position = UDim2.new(0,0,0,25); b.BackgroundColor3 = Color3.fromRGB(50,50,50); b.Parent = f
        local fill = Instance.new("Frame")
        fill.Size = UDim2.new((start-min)/(max-min), 0, 1, 0); fill.BackgroundColor3 = RNUI.ThemeColor; fill.Parent = b
        
        b.InputBegan:Connect(function(input)
            if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
                local function update()
                    local mp = UserInputService:GetMouseLocation().X - b.AbsolutePosition.X
                    local p = math.clamp(mp / b.AbsoluteSize.X, 0, 1)
                    fill.Size = UDim2.new(p, 0, 1, 0)
                    callback(math.floor(min + (max-min)*p))
                end
                update()
                local move = UserInputService.InputChanged:Connect(function(i) 
                    if i.UserInputType == Enum.UserInputType.MouseMovement or i.UserInputType == Enum.UserInputType.Touch then update() end 
                end)
                UserInputService.InputEnded:Connect(function(i) move:Disconnect() end)
            end
        end)
    end

    createUISlider("Largura do Menu", 300, 800, 450, function(v) MainFrame.Size = UDim2.new(0, v, 0, MainFrame.Size.Y.Offset) end)
    createUISlider("Altura do Menu", 200, 600, 300, function(v) MainFrame.Size = UDim2.new(0, MainFrame.Size.X.Offset, 0, v) end)

    -- Sistema de Drag
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

function RNUI:CreateTab(name)
    local TabBtn = Instance.new("TextButton")
    TabBtn.Size = UDim2.new(1, 0, 0, 30)
    TabBtn.BackgroundColor3 = Color3.fromRGB(25, 25, 25)
    TabBtn.Text = name
    TabBtn.TextColor3 = Color3.fromRGB(180, 180, 180)
    TabBtn.Font = Enum.Font.Code
    TabBtn.Parent = TabContainer
    Instance.new("UICorner", TabBtn).CornerRadius = UDim.new(0, 2)

    local Page = Instance.new("ScrollingFrame")
    Page.Size = UDim2.new(1, 0, 1, 0)
    Page.BackgroundTransparency = 1
    Page.Visible = false
    Page.ScrollBarThickness = 2
    Page.Parent = ContentContainer
    Instance.new("UIListLayout", Page).Padding = UDim.new(0, 5)

    TabBtn.MouseButton1Click:Connect(function()
        for _, v in pairs(ContentContainer:GetChildren()) do v.Visible = false end
        Page.Visible = true
        for _, v in pairs(TabContainer:GetChildren()) do if v:IsA("TextButton") then v.TextColor3 = Color3.fromRGB(180, 180, 180) end end
        TabBtn.TextColor3 = RNUI.ThemeColor
    end)

    local TabFuncs = {}
    function TabFuncs:Button(text, cb)
        local b = Instance.new("TextButton")
        b.Size = UDim2.new(1, -10, 0, 30); b.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
        b.Text = text; b.TextColor3 = Color3.new(1,1,1); b.Font = Enum.Font.Code; b.Parent = Page
        Instance.new("UIStroke", b).Color = Color3.fromRGB(50,50,50)
        b.MouseButton1Click:Connect(cb)
    end

    function TabFuncs:Slider(text, min, max, def, cb)
        -- (Código do slider simplificado para o estilo internal)
        local f = Instance.new("Frame")
        f.Size = UDim2.new(1, -10, 0, 45); f.BackgroundTransparency = 1; f.Parent = Page
        local l = Instance.new("TextLabel")
        l.Text = text .. ": " .. def; l.Size = UDim2.new(1,0,0,20); l.TextColor3 = Color3.new(1,1,1); l.BackgroundTransparency = 1; l.Parent = f
        local b = Instance.new("Frame")
        b.Size = UDim2.new(1, 0, 0, 4); b.Position = UDim2.new(0,0,0,30); b.BackgroundColor3 = Color3.fromRGB(40,40,40); b.Parent = f
        local fill = Instance.new("Frame")
        fill.Size = UDim2.new((def-min)/(max-min), 0, 1, 0); fill.BackgroundColor3 = RNUI.ThemeColor; fill.Parent = b
        
        b.InputBegan:Connect(function(input)
            if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
                local move = UserInputService.InputChanged:Connect(function(i)
                    if i.UserInputType == Enum.UserInputType.MouseMovement or i.UserInputType == Enum.UserInputType.Touch then
                        local p = math.clamp((i.Position.X - b.AbsolutePosition.X) / b.AbsoluteSize.X, 0, 1)
                        fill.Size = UDim2.new(p, 0, 1, 0)
                        local v = math.floor(min + (max-min)*p)
                        l.Text = text .. ": " .. v; cb(v)
                    end
                end)
                UserInputService.InputEnded:Connect(function() move:Disconnect() end)
            end
        end)
    end

    if #TabContainer:GetChildren() <= 2 then Page.Visible = true end
    return TabFuncs
end

return RNUI
