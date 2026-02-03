local RNUI = { Tabs = {}, CurrentTab = nil, ThemeColor = Color3.fromRGB(0, 170, 255) }
local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local TweenService = game:GetService("TweenService")
local LocalPlayer = Players.LocalPlayer

function RNUI:Init(config)
    local config = config or {}
    local ScreenGui = Instance.new("ScreenGui")
    ScreenGui.Name = "RNUI_Internal"
    ScreenGui.Parent = LocalPlayer:WaitForChild("PlayerGui")
    ScreenGui.ResetOnSpawn = false

    -- [ BOTÃO FLUTUANTE ]
    local FloatBtn = Instance.new("TextButton")
    FloatBtn.Size = UDim2.new(0, 45, 0, 45)
    FloatBtn.Position = UDim2.new(0, 20, 0.2, 0)
    FloatBtn.BackgroundColor3 = RNUI.ThemeColor
    FloatBtn.Text = "RN"
    FloatBtn.TextColor3 = Color3.new(1,1,1)
    FloatBtn.Visible = false
    FloatBtn.Parent = ScreenGui
    Instance.new("UICorner", FloatBtn).CornerRadius = UDim.new(1, 0)

    -- [ JANELA PRINCIPAL ]
    local MainFrame = Instance.new("Frame")
    MainFrame.Size = UDim2.new(0, 450, 0, 300)
    MainFrame.Position = UDim2.new(0.5, -225, 0.5, -150)
    MainFrame.BackgroundColor3 = Color3.fromRGB(12, 12, 12)
    MainFrame.Parent = ScreenGui
    
    local Stroke = Instance.new("UIStroke", MainFrame)
    Stroke.Color = RNUI.ThemeColor
    Stroke.Thickness = 1.2

    -- [ BARRA DE TÍTULO ]
    local TitleBar = Instance.new("Frame")
    TitleBar.Size = UDim2.new(1, 0, 0, 30)
    TitleBar.BackgroundColor3 = Color3.fromRGB(20, 20, 20)
    TitleBar.Parent = MainFrame

    local Titulo = Instance.new("TextLabel")
    Titulo.Size = UDim2.new(1, -70, 1, 0)
    Titulo.Position = UDim2.new(0, 10, 0, 0)
    Titulo.Text = config.Title or "RN TEAM | INTERNAL"
    Titulo.TextColor3 = Color3.new(1,1,1)
    Titulo.Font = Enum.Font.Code
    Titulo.TextXAlignment = "Left"
    Titulo.BackgroundTransparency = 1
    Titulo.Parent = TitleBar

    local CloseBtn = Instance.new("TextButton")
    CloseBtn.Size = UDim2.new(0, 30, 0, 30)
    CloseBtn.Position = UDim2.new(1, -30, 0, 0)
    CloseBtn.Text = "X"; CloseBtn.TextColor3 = Color3.new(1,0,0); CloseBtn.BackgroundTransparency = 1; CloseBtn.Parent = TitleBar
    
    CloseBtn.MouseButton1Click:Connect(function() MainFrame.Visible = false; FloatBtn.Visible = true end)
    FloatBtn.MouseButton1Click:Connect(function() MainFrame.Visible = true; FloatBtn.Visible = false end)

    -- [ CONTAINERS ]
    local TabContainer = Instance.new("ScrollingFrame")
    TabContainer.Size = UDim2.new(0, 110, 1, -30)
    TabContainer.Position = UDim2.new(0, 0, 0, 30)
    TabContainer.BackgroundTransparency = 1; TabContainer.ScrollBarThickness = 0; TabContainer.Parent = MainFrame
    Instance.new("UIListLayout", TabContainer)

    local ContentContainer = Instance.new("Frame")
    ContentContainer.Size = UDim2.new(1, -115, 1, -35)
    ContentContainer.Position = UDim2.new(0, 115, 0, 35)
    ContentContainer.BackgroundTransparency = 1; ContentContainer.Parent = MainFrame

    -- [ DRAG ]
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

    function RNUI:CreateTab(name)
        local TabBtn = Instance.new("TextButton")
        TabBtn.Size = UDim2.new(1, 0, 0, 30); TabBtn.BackgroundColor3 = Color3.fromRGB(20,20,20)
        TabBtn.Text = name; TabBtn.TextColor3 = Color3.new(0.7,0.7,0.7); TabBtn.Font = Enum.Font.Code; TabBtn.Parent = TabContainer

        local Page = Instance.new("ScrollingFrame")
        Page.Size = UDim2.new(1, 0, 1, 0); Page.BackgroundTransparency = 1; Page.Visible = false; Page.Parent = ContentContainer
        Instance.new("UIListLayout", Page).Padding = UDim.new(0, 5)

        TabBtn.MouseButton1Click:Connect(function()
            for _, v in pairs(ContentContainer:GetChildren()) do v.Visible = false end
            Page.Visible = true
        end)

        local TabFuncs = {}

        -- 1. BOTÃO
        function TabFuncs:Button(text, cb)
            local b = Instance.new("TextButton")
            b.Size = UDim2.new(1, -10, 0, 30); b.BackgroundColor3 = Color3.fromRGB(25,25,25)
            b.Text = text; b.TextColor3 = Color3.new(1,1,1); b.Parent = Page
            b.MouseButton1Click:Connect(cb)
        end

        -- 2. TOGGLE (Liga/Desliga)
        function TabFuncs:Toggle(text, def, cb)
            local state = def
            local t = Instance.new("TextButton")
            t.Size = UDim2.new(1, -10, 0, 30); t.BackgroundColor3 = Color3.fromRGB(25,25,25)
            t.Text = text .. (state and " [ ON ]" or " [ OFF ]"); t.TextColor3 = (state and RNUI.ThemeColor or Color3.new(1,1,1)); t.Parent = Page
            t.MouseButton1Click:Connect(function()
                state = not state
                t.Text = text .. (state and " [ ON ]" or " [ OFF ]")
                t.TextColor3 = (state and RNUI.ThemeColor or Color3.new(1,1,1))
                cb(state)
            end)
        end

        -- 3. SLIDER
        function TabFuncs:Slider(text, min, max, def, cb)
            local f = Instance.new("Frame")
            f.Size = UDim2.new(1, -10, 0, 40); f.BackgroundTransparency = 1; f.Parent = Page
            local l = Instance.new("TextLabel")
            l.Text = text .. ": " .. def; l.Size = UDim2.new(1,0,0,15); l.TextColor3 = Color3.new(1,1,1); l.BackgroundTransparency = 1; l.Parent = f
            local b = Instance.new("Frame")
            b.Size = UDim2.new(1, 0, 0, 4); b.Position = UDim2.new(0,0,0,25); b.BackgroundColor3 = Color3.fromRGB(40,40,40); b.Parent = f
            local fill = Instance.new("Frame")
            fill.Size = UDim2.new((def-min)/(max-min), 0, 1, 0); fill.BackgroundColor3 = RNUI.ThemeColor; fill.Parent = b
            b.InputBegan:Connect(function(input)
                if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
                    local move = UserInputService.InputChanged:Connect(function(i)
                        if i.UserInputType == Enum.UserInputType.MouseMovement or i.UserInputType == Enum.UserInputType.Touch then
                            local p = math.clamp((i.Position.X - b.AbsolutePosition.X) / b.AbsoluteSize.X, 0, 1)
                            fill.Size = UDim2.new(p, 0, 1, 0); local v = math.floor(min + (max-min)*p)
                            l.Text = text .. ": " .. v; cb(v)
                        end
                    end)
                    UserInputService.InputEnded:Connect(function() move:Disconnect() end)
                end
            end)
        end

        if #TabContainer:GetChildren() <= 1 then Page.Visible = true end
        return TabFuncs
    end
    return self
end
return RNUI
