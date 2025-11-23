// Importaciones de Flutter y paquetes necesarios
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:provider/provider.dart';

// Importar nuestros servicios y modelos
import 'services/api_service.dart';
import 'models/product_model.dart';

// Definición de Roles
enum UserRole { admin, user, none }

// -----------------------------------------------------------------------------
// 1. GESTIÓN DE ESTADO (Provider) - ACTUALIZADO
// -----------------------------------------------------------------------------

class AppState extends ChangeNotifier {
  UserRole _currentRole = UserRole.none;
  
  // Base de datos simulada para productos registrados por el Admin (como respaldo)
  final Map<String, Product> _storedProducts = {};
  
  // Carrito para la funcionalidad de escaneo por lotes
  final List<Product> _cart = [];

  UserRole get currentRole => _currentRole;
  List<Product> get cart => _cart;
  Map<String, Product> get storedProducts => _storedProducts;

  /// Simula el inicio de sesión y establece el rol.
  void login(UserRole role) {
    _currentRole = role;
    notifyListeners();
  }

  /// Cierra la sesión y vuelve a la pantalla de login.
  void logout() {
    _currentRole = UserRole.none;
    _cart.clear(); // Limpia el carrito al cerrar sesión
    notifyListeners();
  }

  /// Busca un producto, primero en TU BACKEND, luego en la BD simulada como respaldo.
  Future<Product?> searchProduct(String barcode) async {
    // 1. Buscar en TU BACKEND
    final result = await ApiService.searchProduct(barcode);
    
    if (result['success'] == true && result['data'] != null) {
      // Producto encontrado en tu base de datos
      final product = Product.fromJson(result['data']['product']);
      // Guardar en almacenamiento local como caché
      _storedProducts[barcode] = product;
      return product;
    }

    // 2. Si no existe en el backend, guardar el código escaneado (solo admin)
    if (_currentRole == UserRole.admin) {
      final scanResult = await ApiService.sendBarcodeScan(barcode);
      if (scanResult['success'] == true) {
        print('✅ Código $barcode guardado en base de datos como pendiente');
      }
    }

    // 3. Buscar en la base de datos simulada como respaldo
    if (_storedProducts.containsKey(barcode)) {
      return _storedProducts[barcode];
    }

    return null;
  }
  
  /// Permite al Admin registrar un producto no encontrado.
  void registerProduct(Product product) {
    _storedProducts[product.barcode] = product;
    
    // Opcional: Enviar al backend también
    if (_currentRole == UserRole.admin) {
      _sendProductToBackend(product);
    }
    
    notifyListeners();
  }

  /// Enviar producto completo al backend
  Future<void> _sendProductToBackend(Product product) async {
    final result = await ApiService.saveProduct(product.toJson());
    if (result['success'] == true) {
      print('✅ Producto guardado en backend: ${product.name}');
    } else {
      print('❌ Error al guardar en backend: ${result['message']}');
    }
  }

  /// Añade un producto al carrito (usado en BatchScanScreen).
  void addToCart(Product product) {
    _cart.add(product);
    notifyListeners();
  }

  /// Limpia el carrito actual.
  void clearCart() {
    _cart.clear();
    notifyListeners();
  }

  /// Calcula el total del carrito.
  double get cartTotal => _cart.fold(0.0, (sum, item) => sum + item.price);
}

// -----------------------------------------------------------------------------
// 2. ESTRUCTURA PRINCIPAL DE LA APLICACIÓN
// -----------------------------------------------------------------------------

void main() {
  runApp(
    // Envolvemos la app con ChangeNotifierProvider para la gestión de estado.
    ChangeNotifierProvider(
      create: (context) => AppState(),
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Bodega El Chino',
      theme: ThemeData(
        primarySwatch: Colors.green,
        visualDensity: VisualDensity.adaptivePlatformDensity,
        fontFamily: 'Inter',
        useMaterial3: true,
      ),
      home: const AuthWrapper(),
    );
  }
}

/// Widget que maneja la navegación según el estado de autenticación/rol.
class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    
    switch (appState.currentRole) {
      case UserRole.none:
        return const LoginScreen();
      case UserRole.admin:
        return const AdminHomeScreen();
      case UserRole.user:
        return const UserScannerScreen();
    }
  }
}

// -----------------------------------------------------------------------------
// 3. PANTALLA DE INICIO DE SESIÓN
// -----------------------------------------------------------------------------

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context, listen: false);

    return Scaffold(
      appBar: AppBar(title: const Text('Bodega El Chino - Login')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              const Text(
                'Selecciona tu Rol',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 40),
              ElevatedButton.icon(
                icon: const Icon(Icons.admin_panel_settings),
                label: const Text('Ingresar como ADMINISTRADOR', style: TextStyle(fontSize: 18)),
                onPressed: () => appState.login(UserRole.admin),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green.shade700,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 15, horizontal: 20),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
              const SizedBox(height: 20),
              OutlinedButton.icon(
                icon: const Icon(Icons.person),
                label: const Text('Ingresar como USUARIO', style: TextStyle(fontSize: 18)),
                onPressed: () => appState.login(UserRole.user),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 15, horizontal: 20),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  side: BorderSide(color: Colors.green.shade700, width: 2),
                ),
              ),
              const SizedBox(height: 40),
              Text(
                'Conectado a Base de Datos Local',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.green.shade700, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 10),
              FutureBuilder<bool>(
                future: ApiService.checkConnection(),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Text(
                      'Verificando conexión con el servidor...',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.orange),
                    );
                  }
                  
                  final isConnected = snapshot.data ?? false;
                  return Text(
                    isConnected 
                      ? '✅ Servidor conectado correctamente'
                      : '❌ No se puede conectar al servidor',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: isConnected ? Colors.green : Colors.red,
                      fontWeight: FontWeight.bold,
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// 4. PANTALLAS DE USUARIO
// -----------------------------------------------------------------------------

/// Pantalla principal para el rol USUARIO. Solo permite escanear para ver info.
class UserScannerScreen extends StatelessWidget {
  const UserScannerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Modo Usuario (Consulta Rápida)'),
        backgroundColor: Colors.green,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => Provider.of<AppState>(context, listen: false).logout(),
          )
        ],
      ),
      body: ProductScanner(
        isAdmin: false,
        onProductFound: (product) {
          _showProductDetails(context, product);
        },
        onProductNotFound: (barcode) {
          _showInfoDialog(
            context,
            'Producto no encontrado',
            'El código $barcode no se encontró en la base de datos.\n\nEl administrador ha sido notificado para registrar este producto.',
          );
        },
        onRegistrationNeeded: (barcode) {
          _showInfoDialog(
            context,
            'No Autorizado',
            'Como Usuario, no puedes registrar nuevos productos.\n\nCódigo: $barcode\n\nNotifica al administrador.',
          );
        },
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// 5. PANTALLAS DE ADMINISTRADOR - CORREGIDAS
// -----------------------------------------------------------------------------

/// Pantalla de navegación principal para el rol ADMINISTRADOR - CORREGIDA
class AdminHomeScreen extends StatelessWidget {
  const AdminHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bodega El Chino - Administrador'),
        backgroundColor: Colors.green.shade800,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => Provider.of<AppState>(context, listen: false).logout(),
          )
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            _buildAdminActionCard(
              context,
              icon: Icons.qr_code_scanner,
              title: 'Escaneo y Registro de Productos',
              subtitle: 'Consulta información o registra productos nuevos en la base de datos.',
              targetScreen: AdminScannerScreen(), // ✅ CORREGIDO
            ),
            _buildAdminActionCard(
              context,
              icon: Icons.shopping_cart,
              title: 'Punto de Venta (Totalizador)',
              subtitle: 'Escanea varios productos y suma el total.',
              targetScreen: const BatchScanScreen(), // ✅ CORREGIDO
            ),
            _buildAdminActionCard(
              context,
              icon: Icons.storage,
              title: 'Ver Base de Datos',
              subtitle: 'Explora todos los productos registrados en el sistema.',
              targetScreen: const DatabaseViewScreen(), // ✅ CORREGIDO
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildAdminActionCard(BuildContext context, {required IconData icon, required String title, required String subtitle, required Widget targetScreen}) {
    return Card(
      margin: const EdgeInsets.all(16.0),
      elevation: 8,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      child: ListTile(
        contentPadding: const EdgeInsets.all(20),
        leading: Icon(icon, size: 40, color: Colors.green.shade700),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 8.0),
          child: Text(subtitle),
        ),
        trailing: const Icon(Icons.arrow_forward_ios),
        onTap: () {
          Navigator.of(context).push(MaterialPageRoute(builder: (context) => targetScreen));
        },
      ),
    );
  }
}

/// Pantalla de escaneo para el rol ADMINISTRADOR (con opción a registro).
class AdminScannerScreen extends StatelessWidget {
  AdminScannerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin: Escaneo y Registro'),
        backgroundColor: Colors.green.shade700,
      ),
      body: ProductScanner(
        isAdmin: true,
        onProductFound: (product) {
          _showProductDetails(context, product);
        },
        onProductNotFound: (barcode) {
          _showRegistrationDialog(context, barcode);
        },
        onRegistrationNeeded: (barcode) {
          // Ya manejado por onProductNotFound
        },
      ),
    );
  }
}

/// Pantalla para ver la base de datos completa - VERSIÓN MEJORADA CON DEBUG
class DatabaseViewScreen extends StatefulWidget {
  const DatabaseViewScreen({super.key});

  @override
  State<DatabaseViewScreen> createState() => _DatabaseViewScreenState();
}

class _DatabaseViewScreenState extends State<DatabaseViewScreen> {
  List<dynamic> _products = [];
  bool _isLoading = true;
  String _errorMessage = '';
  String _debugInfo = '';

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  Future<void> _loadProducts() async {
    print('🔄 Iniciando carga de productos...');
    
    try {
      print('📦 Llamando a ApiService.getCatalog()...');
      final result = await ApiService.getCatalog();
      print('📦 Resultado CRUDO de getCatalog(): $result');
      
      if (mounted) {
        setState(() {
          _isLoading = false;
          _debugInfo = 'Status: ${result['success'] ? 'ÉXITO' : 'FALLÓ'}\n'
                      'Mensaje: ${result['message']}\n'
                      'Error: ${result['error']}\n'
                      'Datos recibidos: ${result['data']?.length ?? 0} productos';
          
          if (result['success'] == true) {
            _products = result['data'] ?? [];
            if (_products.isEmpty) {
              _errorMessage = 'No hay productos en la base de datos';
            } else {
              _errorMessage = '';
              print('✅ Productos cargados: ${_products.length}');
              // Mostrar primeros 2 productos para debug
              for (int i = 0; i < (_products.length < 2 ? _products.length : 2); i++) {
                print('   Producto $i: ${_products[i]}');
              }
            }
          } else {
            _errorMessage = result['message'] ?? 'Error desconocido al cargar productos';
            _products = [];
          }
        });
      }
    } catch (e) {
      print('❌ Error en _loadProducts(): $e');
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Error de conexión: $e';
          _debugInfo = 'Excepción: $e';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Base de Datos de Productos'),
        backgroundColor: Colors.blue.shade700,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadProducts,
          ),
          IconButton(
            icon: const Icon(Icons.bug_report),
            onPressed: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Información de Debug'),
                  content: SingleChildScrollView(
                    child: Text(_debugInfo),
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Cerrar'),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text('Cargando productos...'),
                ],
              ),
            )
          : _products.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.inventory_2, size: 64, color: Colors.grey),
                      const SizedBox(height: 16),
                      Text(
                        _errorMessage.isEmpty ? 'No hay productos' : _errorMessage,
                        style: const TextStyle(fontSize: 18, color: Colors.grey),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _loadProducts,
                        child: const Text('Reintentar'),
                      ),
                      const SizedBox(height: 8),
                      TextButton(
                        onPressed: () {
                          showDialog(
                            context: context,
                            builder: (context) => AlertDialog(
                              title: const Text('Debug Info'),
                              content: Text(_debugInfo),
                              actions: [
                                TextButton(
                                  onPressed: () => Navigator.pop(context),
                                  child: const Text('Cerrar'),
                                ),
                              ],
                            ),
                          );
                        },
                        child: const Text('Ver información técnica'),
                      ),
                    ],
                  ),
                )
              : Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Text(
                        'Total: ${_products.length} productos',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.green.shade700,
                        ),
                      ),
                    ),
                    Expanded(
                      child: ListView.builder(
                        itemCount: _products.length,
                        itemBuilder: (context, index) {
                          final product = _products[index];
                          return Card(
                            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                            child: ListTile(
                              leading: const Icon(Icons.inventory_2, size: 40, color: Colors.blue),
                              title: Text(
                                product['nombre']?.toString() ?? 'Sin nombre',
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('Código: ${product['codigo_barras']?.toString() ?? 'N/A'}'),
                                  Text('Precio: S/. ${product['precio_unidad']?.toString() ?? '0.00'}'),
                                  Text('Stock: ${product['stock_actual']?.toString() ?? '0'}'),
                                  Text('Estado: ${product['estado']?.toString() ?? 'activo'}'),
                                ],
                              ),
                              trailing: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    'S/. ${product['precio_unidad']?.toString() ?? '0.00'}',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                  ),
                                  Text(
                                    'Stock: ${product['stock_actual']?.toString() ?? '0'}',
                                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
    );
  }
}

// -----------------------------------------------------------------------------
// 6. PANTALLA DE REGISTRO MANUAL (ADMIN)
// -----------------------------------------------------------------------------

/// Muestra un diálogo para que el Admin registre un producto nuevo.
void _showRegistrationDialog(BuildContext context, String barcode) {
  Navigator.of(context).push(
    MaterialPageRoute(
      builder: (context) => ProductRegistrationScreen(barcode: barcode),
    ),
  );
}

class ProductRegistrationScreen extends StatefulWidget {
  final String barcode;
  const ProductRegistrationScreen({super.key, required this.barcode});

  @override
  State<ProductRegistrationScreen> createState() => _ProductRegistrationScreenState();
}

class _ProductRegistrationScreenState extends State<ProductRegistrationScreen> {
  final _formKey = GlobalKey<FormState>();
  String _name = '';
  String _brand = '';
  double? _price;
  int? _stock;
  String _unit = 'unidad';
  String _description = '';

  void _submitRegistration() {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState!.save();
      
      final newProduct = Product(
        barcode: widget.barcode,
        name: _name,
        brand: _brand,
        price: _price!,
        stock: _stock ?? 0,
        unit: _unit,
        description: _description.isEmpty ? null : _description,
        status: 'activo', // ← CORREGIDO: AGREGADO STATUS
      );
      
      // Guardar en el estado local y enviar al backend
      Provider.of<AppState>(context, listen: false).registerProduct(newProduct);
      
      _showInfoDialog(
        context, 
        '¡Registro Exitoso!', 
        'El producto "${newProduct.name}" ha sido guardado en la base de datos.'
      ).then((_) {
        Navigator.of(context).pop();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Registrar Nuevo Producto'),
        backgroundColor: Colors.orange,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              Text(
                'Código de Barras: ${widget.barcode}',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 20),
              _buildTextFormField(
                label: 'Nombre del Producto *',
                validator: (value) => value!.isEmpty ? 'El nombre es obligatorio' : null,
                onSaved: (value) => _name = value!,
              ),
              const SizedBox(height: 15),
              _buildTextFormField(
                label: 'Marca *',
                validator: (value) => value!.isEmpty ? 'La marca es obligatoria' : null,
                onSaved: (value) => _brand = value!,
              ),
              const SizedBox(height: 15),
              Row(
                children: [
                  Expanded(
                    child: _buildTextFormField(
                      label: 'Precio (S/.) *',
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      validator: (value) {
                        if (value!.isEmpty) return 'El precio es obligatorio';
                        if (double.tryParse(value) == null) return 'Ingresa un número válido';
                        return null;
                      },
                      onSaved: (value) => _price = double.tryParse(value!),
                    ),
                  ),
                  const SizedBox(width: 15),
                  Expanded(
                    child: _buildTextFormField(
                      label: 'Stock *',
                      keyboardType: TextInputType.number,
                      validator: (value) {
                        if (value!.isEmpty) return 'El stock es obligatorio';
                        if (int.tryParse(value) == null) return 'Ingresa un número válido';
                        return null;
                      },
                      onSaved: (value) => _stock = int.tryParse(value!),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 15),
              _buildTextFormField(
                label: 'Unidad de Medida',
                initialValue: 'unidad',
                onSaved: (value) => _unit = value ?? 'unidad',
              ),
              const SizedBox(height: 15),
              _buildTextFormField(
                label: 'Descripción (opcional)',
                maxLines: 3,
                onSaved: (value) => _description = value ?? '',
              ),
              const SizedBox(height: 30),
              ElevatedButton.icon(
                icon: const Icon(Icons.save),
                label: const Text('Guardar en Base de Datos'),
                onPressed: _submitRegistration,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.orange.shade700,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 15),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildTextFormField({
    required String label,
    required FormFieldSetter<String> onSaved,
    FormFieldValidator<String>? validator,
    TextInputType keyboardType = TextInputType.text,
    int maxLines = 1,
    String? initialValue,
  }) {
    return TextFormField(
      decoration: InputDecoration(
        labelText: label,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 15, vertical: 15),
      ),
      keyboardType: keyboardType,
      maxLines: maxLines,
      validator: validator,
      onSaved: onSaved,
      initialValue: initialValue,
    );
  }
}

// -----------------------------------------------------------------------------
// 7. PANTALLA DE ESCANEO POR LOTES / TOTALIZADOR
// -----------------------------------------------------------------------------

class BatchScanScreen extends StatelessWidget {
  const BatchScanScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Totalizador de Venta'),
        backgroundColor: Colors.blue.shade700,
      ),
      body: Column(
        children: <Widget>[
          Expanded(
            flex: 3,
            child: Consumer<AppState>(
              builder: (context, appState, child) {
                return ProductScanner(
                  isAdmin: true, // El Batch Scan necesita acceso a la BD Admin
                  onProductFound: (product) {
                    appState.addToCart(product);
                    _showInfoDialog(
                      context,
                      'Producto Agregado',
                      '${product.name} - S/. ${product.price.toStringAsFixed(2)}\n\nTotal: S/. ${appState.cartTotal.toStringAsFixed(2)}',
                    );
                  },
                  onProductNotFound: (barcode) {
                    _showInfoDialog(
                      context,
                      'Producto Desconocido',
                      'El producto con código $barcode no fue encontrado. Regístralo primero en la opción "Escaneo y Registro".',
                    );
                  },
                  onRegistrationNeeded: (barcode) {
                    // No se permite registro directo desde aquí
                  },
                );
              },
            ),
          ),
          Expanded(
            flex: 2,
            child: CartSummary(),
          ),
        ],
      ),
    );
  }
}

/// Resumen del Carrito y Total.
class CartSummary extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Artículos Escaneados:',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          Expanded(
            child: appState.cart.isEmpty
                ? const Center(child: Text('No hay productos en el carrito'))
                : ListView.builder(
                    itemCount: appState.cart.length,
                    itemBuilder: (context, index) {
                      final item = appState.cart[index];
                      return Card(
                        margin: const EdgeInsets.symmetric(vertical: 4),
                        child: ListTile(
                          title: Text(item.name),
                          subtitle: Text('${item.brand} - ${item.unit}'),
                          trailing: Text('S/. ${item.price.toStringAsFixed(2)}', 
                              style: const TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      );
                    },
                  ),
          ),
          const Divider(),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('TOTAL A PAGAR:', 
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.blue)),
              Text('S/. ${appState.cartTotal.toStringAsFixed(2)}', 
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.blue)),
            ],
          ),
          const SizedBox(height: 10),
          ElevatedButton.icon(
            icon: const Icon(Icons.check_circle_outline),
            label: const Text('Finalizar Venta / Limpiar Carrito', style: TextStyle(fontSize: 18)),
            onPressed: () {
              final total = appState.cartTotal;
              appState.clearCart();
              _showInfoDialog(context, 'Venta Finalizada', 
                  'El carrito ha sido limpiado.\n\nTotal de la venta: S/. ${total.toStringAsFixed(2)}');
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
          ),
        ],
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// 8. WIDGET DE ESCÁNER REUTILIZABLE
// -----------------------------------------------------------------------------

class ProductScanner extends StatefulWidget {
  final bool isAdmin;
  final Function(Product) onProductFound;
  final Function(String) onProductNotFound;
  final Function(String) onRegistrationNeeded;

  const ProductScanner({
    super.key,
    required this.isAdmin,
    required this.onProductFound,
    required this.onProductNotFound,
    required this.onRegistrationNeeded,
  });

  @override
  State<ProductScanner> createState() => _ProductScannerState();
}

class _ProductScannerState extends State<ProductScanner> {
  bool _isScanning = true;
  String _scanResult = 'Esperando código...';
  String? _lastScannedBarcode; // ← NUEVO: Guardar último código escaneado
  DateTime? _lastScanTime; // ← NUEVO: Controlar tiempo entre escaneos
  
  @override
  void initState() {
    super.initState();
    setState(() => _isScanning = true);
  }

  void _onBarcodeDetected(BarcodeCapture capture, AppState appState) async {
    if (!_isScanning) return;
    
    final barcode = capture.barcodes.first.rawValue;
    if (barcode == null) return;

    // ← NUEVO: Prevenir escaneos múltiples del mismo código
    final now = DateTime.now();
    if (_lastScannedBarcode == barcode && 
        _lastScanTime != null && 
        now.difference(_lastScanTime!) < Duration(seconds: 3)) {
      print('⏭️  Ignorando escaneo duplicado: $barcode');
      return;
    }

    print('🔍 Código escaneado: $barcode');
    
    setState(() {
      _isScanning = false;
      _scanResult = 'Escaneado: $barcode\nBuscando en base de datos...';
      _lastScannedBarcode = barcode; // ← GUARDAR CÓDIGO
      _lastScanTime = now; // ← GUARDAR TIEMPO
    });

    try {
      final product = await appState.searchProduct(barcode);
      print('🔍 Resultado búsqueda: $product');

      if (mounted) {
        if (product != null) {
          widget.onProductFound(product);
          setState(() {
            _scanResult = '✅ ${product.name}\nS/. ${product.price.toStringAsFixed(2)}';
          });
        } else {
          print('❌ Producto no encontrado: $barcode');
          if (widget.isAdmin) {
            setState(() {
              _scanResult = '📝 Nuevo producto\nCompleta los datos';
            });
            
            // ← NUEVO: Pequeño delay antes de abrir el registro
            await Future.delayed(Duration(milliseconds: 500));
            
            widget.onProductNotFound(barcode);
          } else {
            setState(() {
              _scanResult = '❌ No encontrado\nContacta al administrador';
            });
            widget.onRegistrationNeeded(barcode);
          }
        }

        // ← MEJORADO: Reactivar después de 3 segundos (más tiempo)
        Future.delayed(const Duration(seconds: 3), () {
          if (mounted) {
            setState(() {
              _isScanning = true;
              _scanResult = 'Listo para escanear...';
            });
          }
        });
      }
    } catch (e) {
      print('❌ Error en escaneo: $e');
      if (mounted) {
        setState(() {
          _scanResult = '❌ Error: $e';
          _isScanning = true;
        });
      }
    }
  }

  // ← NUEVO: Método para reiniciar manualmente el escáner
  void _resetScanner() {
    if (mounted) {
      setState(() {
        _isScanning = true;
        _scanResult = 'Escáner reiniciado\nListo para escanear...';
        _lastScannedBarcode = null;
        _lastScanTime = null;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context, listen: false);

    return Column(
      children: <Widget>[
        Expanded(
          child: Stack(
            children: [
              MobileScanner(
                key: ValueKey(_isScanning),
                onDetect: (capture) => _onBarcodeDetected(capture, appState),
                controller: MobileScannerController(
                  detectionSpeed: DetectionSpeed.normal,
                  autoStart: true,
                  torchEnabled: false,
                ),
                fit: BoxFit.cover,
                errorBuilder: (context, error, child) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.camera_alt, size: 64, color: Colors.grey),
                        const SizedBox(height: 16),
                        Text('Error de cámara: $error', textAlign: TextAlign.center),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: () => setState(() {}),
                          child: const Text('Reintentar'),
                        ),
                      ],
                    ),
                  );
                },
              ),
              // ← NUEVO: Botón para reiniciar manualmente
              if (!_isScanning)
                Positioned(
                  top: 16,
                  right: 16,
                  child: FloatingActionButton.small(
                    onPressed: _resetScanner,
                    child: Icon(Icons.refresh),
                    backgroundColor: Colors.blue,
                  ),
                ),
            ],
          ),
        ),
        Container(
          padding: const EdgeInsets.all(16.0),
          width: double.infinity,
          color: Colors.black87,
          child: Column(
            children: [
              Text(
                _scanResult,
                style: const TextStyle(color: Colors.white, fontSize: 16),
                textAlign: TextAlign.center,
              ),
              // ← NUEVO: Botón para reiniciar en la parte inferior también
              if (!_isScanning) ...[
                SizedBox(height: 8),
                ElevatedButton.icon(
                  icon: Icon(Icons.refresh, size: 16),
                  label: Text('Reiniciar Escáner'),
                  onPressed: _resetScanner,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue,
                    foregroundColor: Colors.white,
                    padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  ),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}
// -----------------------------------------------------------------------------
// 9. UTILIDADES (Diálogos)
// -----------------------------------------------------------------------------

/// Muestra un diálogo con los detalles del producto.
void _showProductDetails(BuildContext context, Product product) {
  showDialog(
    context: context,
    builder: (context) => AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      title: Text(product.name, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green)),
      content: SingleChildScrollView(
        child: ListBody(
          children: <Widget>[
            Text('Marca: ${product.brand}'),
            const Divider(),
            Text('Código: ${product.barcode}'),
            Text('Precio: S/. ${product.price.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold)),
            Text('Stock: ${product.stock} ${product.unit}'),
            if (product.description != null) ...[
              const Divider(),
              Text('Descripción: ${product.description}'),
            ],
          ],
        ),
      ),
      actions: <Widget>[
        TextButton(
          child: const Text('Cerrar', style: TextStyle(color: Colors.green)),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ],
    ),
  );
}

/// Muestra un diálogo de información general.
Future<void> _showInfoDialog(BuildContext context, String title, String content) {
  return showDialog(
    context: context,
    builder: (context) => AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      title: Text(title),
      content: Text(content),
      actions: <Widget>[
        TextButton(
          child: const Text('OK'),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ],
    ),
  );
}