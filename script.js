-- RNUI LIBRARY V2 - RN TEAM
local RNUI = {
    Tabs = {},
    CurrentTab = nil
}

-- Serviços
local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local TweenService = game:GetService("TweenService")

-- Variáveis globais
local LocalPlayer = Players.LocalPlayer
local ScreenGui, MainFrame, TabContainer, ContentContainer

function RNUI:Init(config)
    config = config or {}
    
    ScreenGui = Instance.new("ScreenGui")
    ScreenGui.Parent = LocalPlayer:WaitForChild("PlayerGui")
    ScreenGui.ResetOnSpawn = false
    
    -- Main Frame (Aumentado para acomodar abas)
    MainFrame = Instance.new("Frame")
    MainFrame.Size = UDim2.new(0, 450, 0, 300)
    MainFrame.Position = UDim2.new(0.5, -225, 0.5, -150)
    MainFrame.BackgroundColor3 = Color3.fromRGB(15, 15, 15)
    MainFrame.BorderSizePixel = 0
    MainFrame.Parent = ScreenGui
    
    local MainCorner = Instance.new("UICorner")
    MainCorner.CornerRadius = UDim.new(0, 10)
    MainCorner.Parent = MainFrame

    -- Barra Lateral (Abas)
    TabContainer = Instance.new("Frame")
    TabContainer.Name = "TabContainer"
    TabContainer.Size = UDim2.new(0, 120, 1, -40)
    TabContainer.Position = UDim2.new(0, 10, 0, 35)
    TabContainer.BackgroundTransparency = 1
    TabContainer.Parent = MainFrame
    
    local TabListLayout = Instance.new("UIListLayout")
    TabListLayout.Padding = UDim.new(0, 5)
    TabListLayout.Parent = TabContainer

    -- Container de Conteúdo
    ContentContainer = Instance.new("Frame")
    ContentContainer.Name = "ContentContainer"
    ContentContainer.Size = UDim2.new(1, -145, 1, -50)
    ContentContainer.Position = UDim2.new(0, 135, 0, 40)
    ContentContainer.BackgroundTransparency = 1
    ContentContainer.Parent = MainFrame

    -- Título e Dragging (Mesma lógica sua, mas polida)
    local TitleBar = Instance.new("Frame")
    TitleBar.Size = UDim2.new(1, 0, 0, 30)
    TitleBar.BackgroundColor3 = Color3.fromRGB(25, 25, 25)
    TitleBar.Parent = MainFrame
    
    local Titulo = Instance.new("TextLabel")
    Titulo.Size = UDim2.new(1, -40, 1, 0)
    Titulo.Position = UDim2.new(0, 10, 0, 0)
    Titulo.BackgroundTransparency = 1
    Titulo.Text = config.Title or "RN TEAM | V2"
    Titulo.TextColor3 = Color3.fromRGB(255, 255, 255)
    Titulo.Font = Enum.Font.GothamBold
    Titulo.TextSize = 14
    Titulo.TextXAlignment = Enum.TextXAlignment.Left
    Titulo.Parent = TitleBar

    -- [SISTEMA DE DRAG REUTILIZADO DO SEU CÓDIGO]
    local dragging, dragInput, dragStart, startPos
    TitleBar.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
            dragging = true; dragStart = input.Position; startPos = MainFrame.Position
            input.Changed:Connect(function() if input.UserInputState == Enum.UserInputState.End then dragging = false end end)
        end
    end)
    UserInputService.InputChanged:Connect(function(input)
        if dragging and (input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch) then
            local delta = input.Position - dragStart
            MainFrame.Position = UDim2.new(startPos.X.Scale, startPos.X.Offset + delta.X, startPos.Y.Scale, startPos.Y.Offset + delta.Y)
        end
    end)

    return self
end

function RNUI:CreateTab(name)
    local TabButton = Instance.new("TextButton")
    TabButton.Size = UDim2.new(1, 0, 0, 30)
    TabButton.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
    TabButton.Text = name
    TabButton.TextColor3 = Color3.fromRGB(200, 200, 200)
    TabButton.Font = Enum.Font.Gotham
    TabButton.TextSize = 12
    TabButton.Parent = TabContainer
    
    local Corner = Instance.new("UICorner")
    Corner.CornerRadius = UDim.new(0, 6)
    Corner.Parent = TabButton

    local Page = Instance.new("ScrollingFrame")
    Page.Size = UDim2.new(1, 0, 1, 0)
    Page.BackgroundTransparency = 1
    Page.Visible = false
    Page.ScrollBarThickness = 2
    Page.ScrollBarImageColor3 = Color3.fromRGB(0, 170, 255)
    Page.Parent = ContentContainer
    
    local Layout = Instance.new("UIListLayout")
    Layout.Padding = UDim.new(0, 8)
    Layout.Parent = Page

    TabButton.MouseButton1Click:Connect(function()
        for _, v in pairs(ContentContainer:GetChildren()) do v.Visible = false end
        for _, v in pairs(TabContainer:GetChildren()) do 
            if v:IsA("TextButton") then 
                TweenService:Create(v, TweenInfo.new(0.2), {BackgroundColor3 = Color3.fromRGB(30, 30, 30)}):Play()
            end 
        end
        Page.Visible = true
        TweenService:Create(TabButton, TweenInfo.new(0.2), {BackgroundColor3 = Color3.fromRGB(0, 170, 255)}):Play()
    end)

    -- Funções da Aba (Buttons, Toggles, Sliders)
    local TabFunctions = {}

    function TabFunctions:Button(text, callback)
        local Btn = Instance.new("TextButton")
        Btn.Size = UDim2.new(1, -10, 0, 35)
        Btn.BackgroundColor3 = Color3.fromRGB(35, 35, 35)
        Btn.Text = text
        Btn.TextColor3 = Color3.fromRGB(255, 255, 255)
        Btn.Font = Enum.Font.GothamSemibold
        Btn.Parent = Page
        Instance.new("UICorner", Btn).CornerRadius = UDim.new(0, 6)
        Btn.MouseButton1Click:Connect(callback)
    end

    function TabFunctions:Slider(text, min, max, default, callback)
        local SliderFrame = Instance.new("Frame")
        SliderFrame.Size = UDim2.new(1, -10, 0, 50)
        SliderFrame.BackgroundColor3 = Color3.fromRGB(25, 25, 25)
        SliderFrame.Parent = Page
        Instance.new("UICorner", SliderFrame).CornerRadius = UDim.new(0, 6)

        local Label = Instance.new("TextLabel")
        Label.Text = text .. ": " .. default
        Label.Size = UDim2.new(1, 0, 0, 25)
        Label.Position = UDim2.new(0, 10, 0, 0)
        Label.TextColor3 = Color3.fromRGB(255, 255, 255)
        Label.BackgroundTransparency = 1
        Label.TextXAlignment = Enum.TextXAlignment.Left
        Label.Parent = SliderFrame

        local Bar = Instance.new("Frame")
        Bar.Size = UDim2.new(1, -20, 0, 6)
        Bar.Position = UDim2.new(0, 10, 0, 32)
        Bar.BackgroundColor3 = Color3.fromRGB(45, 45, 45)
        Bar.Parent = SliderFrame
        
        local Fill = Instance.new("Frame")
        Fill.Size = UDim2.new((default-min)/(max-min), 0, 1, 0)
        Fill.BackgroundColor3 = Color3.fromRGB(0, 170, 255)
        Fill.BorderSizePixel = 0
        Fill.Parent = Bar

        local function update(input)
            local pos = math.clamp((input.Position.X - Bar.AbsolutePosition.X) / Bar.AbsoluteSize.X, 0, 1)
            Fill.Size = UDim2.new(pos, 0, 1, 0)
            local val = math.floor(min + (max-min)*pos)
            Label.Text = text .. ": " .. val
            callback(val)
        end

        Bar.InputBegan:Connect(function(input)
            if input.UserInputType == Enum.UserInputType.MouseButton1 then
                local conn = UserInputService.InputChanged:Connect(function(i)
                    if i.UserInputType == Enum.UserInputType.MouseMovement then update(i) end
                end)
                UserInputService.InputEnded:Connect(function(i)
                    if i.UserInputType == Enum.UserInputType.MouseButton1 then conn:Disconnect() end
                end)
            end
        end)
    end

    return TabFunctions
end

return RNUI