<?php
namespace Proservia\GestionReparationBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\JsonResponse;

class TicketDashboardController extends Controller
{
    /**
     * @Route(path="/ajax/dashboard/get/graph/newticket",name="ajax_get_graph_newticket")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function getNewTicketsGraphInfos()
    {
        $result = $this->get('repair.ticket_manager')->countTicketByYearWeek();
        $finalTab = [];
        $legendTab = [];
        foreach ($result as $item) {
            $finalTab[] = (object)array('name' =>$item['yr'].$item['wk'], 'value' => (int)$item['item1']);
            $legendTab[] = $item['yr'].$item['wk'];
        }
        return new JsonResponse(array('legend'=> $legendTab, 'datas' =>$finalTab));
    }

    /**
     * @Route(path="/ajax/dashboard/get/graph/solved_ticket",name="ajax_get_graph_solved_ticket")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function getSolvedTicketsGraphInfos()
    {
        $result = $this->get('repair.ticket_manager')->countSolvedTicketByYearWeek();
        $finalTab = [];
        $legendTab = [];
        foreach ($result as $item) {
            $finalTab[] = (object)array('name' =>$item['yr'].$item['wk'], 'value' => (int)$item['item1']);
            $legendTab[] = $item['yr'].$item['wk'];
        }
        return new JsonResponse(array('legend'=> $legendTab, 'datas' =>$finalTab));
    }

    /**
     * @Route(path="/ajax/dashboard/get/graph/status", name="ajax_get_graph_status")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function getStatusGraphInfos()
    {
        $result = $this->get('repair.ticket_manager')->countTicketByStatus();
        $dataTab = [];
        $legendTab = [];
        foreach ($result as $item) {
            $legendTab[] = (string)$item['status'];
            $dataTab[] = (object)array('value' => (int)$item['nbTicket'], 'name' => (string)$item['status']);
        }
        $finalTab = array('legend' => $legendTab, 'datas' => $dataTab);
        return new JsonResponse($finalTab);
    }

    /**
     * @Route(path="/ajax/dashboard/get/graph/type_panne", name="ajax_get_graph_type_panne")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function getTypePanneGraphInfos()
    {
        $result = $this->get('repair.ticket_manager')->countTicketByTypePanne();
        $dataTab = [];
        $legendTab = [];
        foreach ($result as $item) {
            $legendTab[] = (string)$item['typePanne'];
            $dataTab[] = (object)array('value' => (int)$item['nbTicket'], 'name' => (string)$item['typePanne']);
        }
        $finalTab = array('legend' => $legendTab, 'datas' => $dataTab);
        return new JsonResponse($finalTab);
    }

    /**
     * @Route(path="/ajax/dashboard/get/graph/model_category", name="ajax_get_graph_model_category")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function getTypModelCategoryGraphInfos()
    {
        $result = $this->get('repair.ticket_manager')->countTicketByModelCategory();
        $dataTab = [];
        $legendTab = [];
        foreach ($result as $item) {
            $legendTab[] = (string)$item['catProduct'];
            $dataTab[] = (object)array('value' => (int)$item['nbTicket'], 'name' => (string)$item['catProduct']);
        }
        $finalTab = array('legend' => $legendTab, 'datas' => $dataTab);
        return new JsonResponse($finalTab);
    }

    /**
     * @Route(path="/ajax/dashboard/get/graph/model", name="ajax_get_graph_model")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function getTypModelGraphInfos()
    {
        $result = $this->get('repair.ticket_manager')->countTicketByModelAndCategory();

        $tempTab = [];
        $dataTab = [];
        $legendTab = [];
        foreach ($result as $item) {
            $legendTab[] = (string)$item['product'];
            if (!isset($tempTab[$item['catProduct']])) {
                $tempTab[$item['catProduct']] = [];
            }
            array_push($tempTab[$item['catProduct']], array('name' => (string)$item['product'], 'value' => (int)$item['nbTicket']));
            $dataTab[] = (object)array('value' => (int)$item['nbTicket'], 'name' => (string)$item['product']);
        }
        $finalTab = array('legend' => $legendTab, 'datas' => $dataTab);
        return new JsonResponse($finalTab);
    }

    /**
     * @Route(path="/ajax/dashboard/get/graph/recursiveEndOfWeek", name="ajax_get_graph_recursiveEndOfWeek")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function getrecursiveStockGraphInfos()
    {
        $result = $this->get('repair.ticket_manager')->recursiveEndOfWeek();
        return new JsonResponse($result);
    }

    /**
     * @Route(path="/ajax/dashboard/get/graph/end_of_warranty", name="ajax_get_graph_end_of_warranty")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function getEndOfWarrantyCount()
    {
        $result = $this->get('repair.ticket_manager')->countTicketEndOfWarranty();
        $dataTab = [];
        $legendTab = [];
        foreach ($result as $item) {
            $legendTab[] = (string)$item['yearmonth'];
            $dataTab[] = (object)array('value' => (int)$item['nbTicket'], 'name' => (string)$item['yearmonth']);
        }
        $finalTab = array('legend' => $legendTab, 'datas' => $dataTab);
        return new JsonResponse($finalTab);
    }

    /**
     * @Route("/repair/dashboard/ticket_dashboard", name="admin_ticket_dashboard")
     */
    public function indexAction()
    {
        $session_messaging = $this->get('session')->get('messaging');
        $this->get('session')->set('messaging', []);
        $globalAlertColor = $this->get('core.index.controller_service')->getGlobalAlertColor($session_messaging);
        $userInfos = $this->get('security.token_storage')->getToken()->getUser();

        return $this->render('@ProserviaGestionReparation/Dashboard/dashboard.html.twig', array(
            'panel'                            => 'admin',
            'nb_ticket_7days'                  => $this->get('repair.ticket_manager')->countTicketByCreateDate(date("Y-m-d", time() -(7 * 60 * 24 * 60)), date("Y-m-d", time()))[0],
            'nb_ticket_7days_last_week'        => $this->get('repair.ticket_manager')->countTicketByCreateDate(date("Y-m-d", time() -(14 * 60 * 24 * 60)), date("Y-m-d", time() -(7 * 60 * 24 * 60)))[0],
            'nb_ticket_solved_7days'           => $this->get('repair.ticket_manager')->countTicketBySolvedDate(date("Y-m-d", time() -(7 * 60 * 24 * 60)), date("Y-m-d", time()))[0],
            'nb_ticket_solved_7days_last_week' => $this->get('repair.ticket_manager')->countTicketBySolvedDate(date("Y-m-d", time() -(14 * 60 * 24 * 60)), date("Y-m-d", time() -(7 * 60 * 24 * 60)))[0],
            'nb_total_ticket'                  => $this->get('repair.ticket_manager')->countTicketTotal()[0],
            'count_moyenne_jour_non_resolu'    => $this->get('repair.ticket_manager')->countMoyenneJourNonResolu()[0],
            'session_messaging'                => $session_messaging,
            'currentUserInfos'                 => $userInfos,
            'globalAlertColor'                 => $globalAlertColor,
            'remaining_gmail_licenses'         => $this->get('app.parameters_calls')->getParam('remaining_google_licenses'),
            'remaining_salesforce_licenses'    => $this->get('app.parameters_calls')->getParam('remaining_licences_type_Salesforce'),
        ));
    }
}
