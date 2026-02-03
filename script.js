local RNUI = { Tabs = {}, CurrentTab = nil }
local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local TweenService = game:GetService("TweenService")
local LocalPlayer = Players.LocalPlayer

local ScreenGui, MainFrame, TabContainer, ContentContainer, FloatBtn

function RNUI:Init(config)
    config = config or {}
    
    ScreenGui = Instance.new("ScreenGui")
    ScreenGui.Name = "RNUI_Mobile"
    ScreenGui.Parent = LocalPlayer:WaitForChild("PlayerGui")
    ScreenGui.ResetOnSpawn = false

    -- Botão Flutuante (Para abrir quando estiver fechado)
    FloatBtn = Instance.new("TextButton")
    FloatBtn.Size = UDim2.new(0, 50, 0, 50)
    FloatBtn.Position = UDim2.new(0, 10, 0.5, -25)
    FloatBtn.BackgroundColor3 = Color3.fromRGB(0, 170, 255)
    FloatBtn.Text = "RN"
    FloatBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
    FloatBtn.Font = Enum.Font.GothamBold
    FloatBtn.Visible = false -- Começa escondido
    FloatBtn.Parent = ScreenGui
    Instance.new("UICorner", FloatBtn).CornerRadius = UDim.new(1, 0)

    -- Main Frame
    MainFrame = Instance.new("Frame")
    MainFrame.Size = UDim2.new(0, 400, 0, 280) -- Tamanho otimizado para mobile
    MainFrame.Position = UDim2.new(0.5, -200, 0.5, -140)
    MainFrame.BackgroundColor3 = Color3.fromRGB(15, 15, 15)
    MainFrame.BorderSizePixel = 0
    MainFrame.ClipsDescendants = true
    MainFrame.Parent = ScreenGui
    Instance.new("UICorner", MainFrame).CornerRadius = UDim.new(0, 10)

    -- Barra de Título
    local TitleBar = Instance.new("Frame")
    TitleBar.Size = UDim2.new(1, 0, 0, 35)
    TitleBar.BackgroundColor3 = Color3.fromRGB(25, 25, 25)
    TitleBar.Parent = MainFrame

    local Titulo = Instance.new("TextLabel")
    Titulo.Size = UDim2.new(1, -80, 1, 0)
    Titulo.Position = UDim2.new(0, 15, 0, 0)
    Titulo.BackgroundTransparency = 1
    Titulo.Text = config.Title or "RN TEAM V2"
    Titulo.TextColor3 = Color3.fromRGB(255, 255, 255)
    Titulo.Font = Enum.Font.GothamBold
    Titulo.TextSize = 14
    Titulo.TextXAlignment = Enum.TextXAlignment.Left
    Titulo.Parent = TitleBar

    -- Botão Fechar (X)
    local CloseBtn = Instance.new("TextButton")
    CloseBtn.Size = UDim2.new(0, 35, 0, 35)
    CloseBtn.Position = UDim2.new(1, -35, 0, 0)
    CloseBtn.BackgroundTransparency = 1
    CloseBtn.Text = "X"
    CloseBtn.TextColor3 = Color3.fromRGB(255, 80, 80)
    CloseBtn.Font = Enum.Font.GothamBold
    CloseBtn.TextSize = 18
    CloseBtn.Parent = TitleBar

    CloseBtn.MouseButton1Click:Connect(function()
        MainFrame.Visible = false
        FloatBtn.Visible = true
    end)

    FloatBtn.MouseButton1Click:Connect(function()
        MainFrame.Visible = true
        FloatBtn.Visible = false
    end)

    -- Containers
    TabContainer = Instance.new("ScrollingFrame")
    TabContainer.Size = UDim2.new(0, 100, 1, -45)
    TabContainer.Position = UDim2.new(0, 10, 0, 40)
    TabContainer.BackgroundTransparency = 1
    TabContainer.ScrollBarThickness = 0
    TabContainer.Parent = MainFrame
    
    local TabList = Instance.new("UIListLayout")
    TabList.Padding = UDim.new(0, 5)
    TabList.Parent = TabContainer

    ContentContainer = Instance.new("Frame")
    ContentContainer.Size = UDim2.new(1, -130, 1, -45)
    ContentContainer.Position = UDim2.new(0, 120, 0, 40)
    ContentContainer.BackgroundTransparency = 1
    ContentContainer.Parent = MainFrame

    -- Sistema de Arrastar (Mobile Friendly)
    local dragStart, startPos, dragging
    TitleBar.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
            dragging = true
            dragStart = input.Position
            startPos = MainFrame.Position
        end
    end)

    UserInputService.InputChanged:Connect(function(input)
        if dragging and (input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch) then
            local delta = input.Position - dragStart
            MainFrame.Position = UDim2.new(startPos.X.Scale, startPos.X.Offset + delta.X, startPos.Y.Scale, startPos.Y.Offset + delta.Y)
        end
    end)

    UserInputService.InputEnded:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
            dragging = false
        end
    end)

    return self
end

function RNUI:CreateTab(name)
    local TabButton = Instance.new("TextButton")
    TabButton.Size = UDim2.new(1, 0, 0, 35)
    TabButton.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
    TabButton.Text = name
    TabButton.TextColor3 = Color3.fromRGB(200, 200, 200)
    TabButton.Font = Enum.Font.Gotham
    TabButton.Parent = TabContainer
    Instance.new("UICorner", TabButton).CornerRadius = UDim.new(0, 6)

    local Page = Instance.new("ScrollingFrame")
    Page.Size = UDim2.new(1, 0, 1, 0)
    Page.BackgroundTransparency = 1
    Page.Visible = false
    Page.ScrollBarThickness = 3
    Page.CanvasSize = UDim2.new(0,0,0,0)
    Page.Parent = ContentContainer
    
    local Layout = Instance.new("UIListLayout")
    Layout.Padding = UDim.new(0, 8)
    Layout.Parent = Page
    
    Layout:GetPropertyChangedSignal("AbsoluteContentSize"):Connect(function()
        Page.CanvasSize = UDim2.new(0, 0, 0, Layout.AbsoluteContentSize.Y + 10)
    end)

    TabButton.MouseButton1Click:Connect(function()
        for _, v in pairs(ContentContainer:GetChildren()) do v.Visible = false end
        Page.Visible = true
    end)

    local TabFunctions = {}

    function TabFunctions:Button(text, callback)
        local Btn = Instance.new("TextButton")
        Btn.Size = UDim2.new(1, -10, 0, 40)
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
        SliderFrame.Size = UDim2.new(1, -10, 0, 55)
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
        Bar.Size = UDim2.new(1, -20, 0, 10) -- Bar maior para facilitar no toque
        Bar.Position = UDim2.new(0, 10, 0, 35)
        Bar.BackgroundColor3 = Color3.fromRGB(45, 45, 45)
        Bar.Parent = SliderFrame
        
        local Fill = Instance.new("Frame")
        Fill.Size = UDim2.new((default-min)/(max-min), 0, 1, 0)
        Fill.BackgroundColor3 = Color3.fromRGB(0, 170, 255)
        Fill.Parent = Bar

        local function update(input)
            local pos = math.clamp((input.Position.X - Bar.AbsolutePosition.X) / Bar.AbsoluteSize.X, 0, 1)
            Fill.Size = UDim2.new(pos, 0, 1, 0)
            local val = math.floor(min + (max-min)*pos)
            Label.Text = text .. ": " .. val
            callback(val)
        end

        Bar.InputBegan:Connect(function(input)
            if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
                update(input)
                local move = UserInputService.InputChanged:Connect(function(i)
                    if i.UserInputType == Enum.UserInputType.MouseMovement or i.UserInputType == Enum.UserInputType.Touch then
                        update(i)
                    end
                end)
                UserInputService.InputEnded:Connect(function(i)
                    if i.UserInputType == Enum.UserInputType.MouseButton1 or i.UserInputType == Enum.UserInputType.Touch then
                        move:Disconnect()
                    end
                end)
            end
        end)
    end

    if #TabContainer:GetChildren() <= 1 then Page.Visible = true end
    return TabFunctions
end

return RNUI
