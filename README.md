# JerrysQuickMart
## Technical Exercise Walkthrough
Dylan Hernández P.
September 6th, 2025
## How to run?
1. Download or clone this repository.
2. Using a local server (e.g., Live Server extension in VSCode), open `index.html` in your favorite browser.
> Important: Do not open the file directly in the browser, as it will not be able to read the inventory file due to CORS policy.
Another option is to use Python's built-in HTTP server. Navigate to the project directory in your terminal and run:

 ```
 python -m http.server
 ```
 
Then, open your browser and go to `http://localhost:8000`.
## Requirements Engineering
### Functional:
The functional requirements detail the need for processing cash transactions, keeping stock control, handling cart items and generating receipts.
### Non-Functional:
On the other hand, non-functional requirements include interoperability. Juan José needs to test this prototype on his own machine. Thus, the technological requirements will gravitate towards a cross-platform solution. Web technologies, in this case.
### Tech Stack:
According to the non-functional requirements of interoperability, JavaScript is the chosen language for logic, using basic HTML/CSS for the design.
## Analysis and Design
After a thorough examination, this is the UML Class Diagram to represent the application interaction:
<img src="assets/UMLClassDiagram.png" alt="UML Class Diagram" width="600"/>

At first glance, Item and Cart Item share properties so they should both inherit from an abstract Item class. However, for practical purposes and according to the unique responsibility principle, they are related through a directed relationship where a Cart Item references an Inventory Item using the product name as the key.
Architecture:

This is a serverless architecture, where all the logic happens in the browser. This is scalable for a client/server architecture once we have a real backend.

For the logic, we create classes for each representation on the diagram. We need a method for getting the price according to the customer’s needs and another to return the tax status. The question mark indicates a short if/then syntax. 

