import tkinter as tk
import tkinter.messagebox
import pandas as pd
import math
import numpy as np

# Read data
data = pd.read_csv('C:/Users/geand/OneDrive - Linköpings universitet/InfoVis/Labbar/Lab2/data2.csv').to_numpy()

objects = []  # save the points in an array
original_data = data.copy()  # Store original data

x_values = data[:, 0]
y_values = data[:, 1]
class_values = data[:, 2]

# Creating DataFrame
names = pd.DataFrame({'x-val': x_values, 'y-val': y_values, 'class': class_values})
names = names.drop_duplicates(subset=['class'])
remaining_classes = names['class'].unique()

# Window
window = tk.Tk()
window.title("Assignment 2")

window_width = 500
window_height = 500
origin_x = window_width / 2
origin_y = window_height / 2

# Find max min
x_values = [point[0] for point in data]
y_values = [point[1] for point in data]

x_range = max(abs(min(x_values)), abs(max(x_values)))
y_range = max(abs(min(y_values)), abs(max(y_values)))

scale_x = origin_x / x_range
scale_y = origin_y / y_range

#index saved for nearest points
last_clicked_index = 9999



# Create a window widget
window_plot = tk.Canvas(window, width=window_width,
                        height=window_height, bg="white")

#Create the plot with axis and numbers
def create_plot():
    window_plot.create_line(0, origin_y, window_width, origin_y, fill="black")  # x-axis
    window_plot.create_line(origin_x, 0, origin_x, window_height, fill="black")  # y-axis

    # Ticks and numbers on the x-axis
    for i in range(-int(x_range), int(x_range + 1), int(x_range * 2 / 21)):
        x = round(origin_x + i * scale_x)
        window_plot.create_line(x, origin_y - 4, x, origin_y + 4, fill="black", width=1)
        window_plot.create_text(x, origin_y + 10, text=str(i))

    # Ticks and numbers on the y-axis
    for i in range(-int(y_range), int(y_range) + 1, int(y_range * 2 / 21)):
        y = round(origin_y - i * scale_y)
        window_plot.create_line(origin_x - 4, y, origin_x + 4, y, fill="black", width=1)
        window_plot.create_text(origin_x - 15, y, text=str(i))

    # legend ==========================================================
    legend = tk.Canvas(window_plot, width=60, height=60, borderwidth=1, bg="gray")
    legend.place(x=5, y=5)

    #text
    legend.create_text(25, 25, text="""
        a, baz
        b, bar
        c, foo""", fill="white")

    # Circle
    x = 10
    y = 15
    legend.create_oval(x, y, x+8, y+8, fill='red')

    # Rectanglr
    x = 10
    y = 30
    legend.create_rectangle(x, y, x+7, y+7, fill='red')

    # Triangle
    points = [
             (x+8 , y+24),
            (x+8, y+16),
            (x, y+16),
            (x+8, y+24),
        ]
    legend.create_polygon(points, outline='black',fill='red')
    # ================================================================


def create_shapes(x, y, type, index):
    r = 5
    x0 = origin_x + x * scale_x - r
    x1 = origin_x + x * scale_x + r
    y0 = origin_y - y * scale_y - r
    y1 = origin_y - y * scale_y + r

    x_color = origin_x + x 
    y_color = origin_y + y

    width_origo = 1

   # Change colors depending on what quadrant==================
    color = 'black'
    if x_color > origin_x and y_color > origin_y:
        color = 'green'
    elif x_color > origin_x and y_color < origin_y:
        color ='red'
    elif x_color < origin_x and y_color > origin_y:
        color = 'blue'
    elif x_color < origin_x and y_color < origin_y:
        color ='orange'
    elif x_color == origin_x and y_color == origin_y:
        color ='cyan'
        width_origo = 2

    #===================================================
    
    # Print shapes depending on "class" (a,b,c. etc)  
    if (type == remaining_classes[0]):
        return window_plot.create_oval(x0, y0, x1, y1, fill=color, width=width_origo)
    elif (type == remaining_classes[1]):
        return window_plot.create_rectangle(x0, y0, x1, y1, fill=color,width=width_origo)
    elif (type == remaining_classes[2]):
        points = [
             (x1 , y1),
            (x1, y0),
            (x0, y0),
            (x1, y1),
        ]
        return window_plot.create_polygon(points, fill=color,outline='black' ,width=width_origo)
    elif (type == remaining_classes[3]):
        points = [
            (x0, y0 - 8),  # Top point
            (x0 + 3, y0 - 2),  # Upper right corner
            (x0 + 8, y0 - 2),  # Upper right point
            (x0 + 4, y0 + 1),  # Middle right corner
            (x0 + 6, y0 + 8),  # Bottom right point
            (x0, y0 + 4),  # Bottom point
            (x0 - 6, y0 + 8),  # Bottom left point
            (x0 - 4, y0 + 1),  # Middle left corner
            (x0 - 8, y0 - 2),  # Upper left point
            (x0 - 3, y0 - 2),  # Upper left corner
        ]
        return window_plot.create_polygon(points, fill=color, outline='black',width=width_origo)
        
    elif (type == remaining_classes[4]):
        points = [
        (x0, y0 - 5),
        (x0 + 5, y0),
        (x0, y0 + 5),
        (x0 - 5, y0),
        ]
        return window_plot.create_polygon(points, fill=color,outline='black',width=width_origo)
    else:
        return window_plot.create_oval(x0+1, y0, x1-1, y1, fill=color,width=width_origo)
    #======================================================================


def plot_shapes():
    for i in range(len(data)): 
        #Clickabe plot points
        shape_id = create_shapes(data[i][0], data[i][1], data[i][2], i)
        window_plot.tag_bind(shape_id, '<Button-3>', lambda event, index=i: display_values(index))
        window_plot.tag_bind(shape_id, '<Button-2>', lambda event, index=i: display_nearest(index))
        window_plot.tag_bind(shape_id, '<Button-1>', lambda event, index=i: shift_values(index))

def display_values(index):
    #if right click, diplay its values
    x, y, classification = data[index]
    tk.messagebox.showinfo("Point Information", f"X: {x}, Y: {y}, Classification: {classification}")


def display_nearest(index):
        global last_clicked_index
        
        redraw_plot()
        # Removes highlighted dots if clicked again, kind of a bad soultion but works
        if index == last_clicked_index:
           last_clicked_index = 9999
           return
        else: 

            x, y, _ = data[index]
            
            # Calculate differences in coordinates
            differences = data[:, :2] - np.array([x, y])
            
            # Calculate squared Euclidean distances
            squared_distances = np.sum(differences ** 2, axis=1)
            
            # Find indices of the five nearest points based on squared distances
            nearest_indices = np.argsort(squared_distances)[:6]
            print(nearest_indices)
            
            # Highlight the five nearest points
            for i in range(len(data)):
                if i in nearest_indices:
                    if i == index:
                        last_clicked_index = index
                    else:
                        shape_id = create_shapes(data[i][0], data[i][1], data[i][2], i)
                        window_plot.itemconfig(shape_id, fill='cyan') 
        


def redraw_plot():
    window_plot.delete("all")
    create_plot()
    plot_shapes()
    window_plot.pack()

def shift_values(index):
    global data
    x, y, _ = data[index]

    if (x, y) == (0,0):
        data = original_data.copy()
        redraw_plot()
        return

    #shift all dots    
    for point in data:
        point[0] -= x
        point[1] -= y
    redraw_plot()




create_plot()
plot_shapes()
window_plot.pack()
window.mainloop()